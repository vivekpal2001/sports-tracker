import fs from 'fs/promises';
import { parseString } from 'xml2js';
import { promisify } from 'util';

const parseXML = promisify(parseString);

// Parse GPX file
export const parseGPX = async (filepath) => {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const result = await parseXML(content);
    
    const gpx = result.gpx;
    const track = gpx.trk?.[0];
    const trackSegment = track?.trkseg?.[0];
    const points = trackSegment?.trkpt || [];
    
    if (points.length === 0) {
      return {
        workouts: [{
          title: track?.name?.[0] || 'GPX Import',
          distance: 0,
          duration: 0
        }]
      };
    }
    
    // Calculate distance and duration
    let totalDistance = 0;
    let elevationGain = 0;
    let heartRates = [];
    let previousPoint = null;
    
    const startTime = points[0].time?.[0] ? new Date(points[0].time[0]) : null;
    const endTime = points[points.length - 1].time?.[0] 
      ? new Date(points[points.length - 1].time[0]) 
      : null;
    
    for (const point of points) {
      const lat = parseFloat(point.$.lat);
      const lon = parseFloat(point.$.lon);
      const ele = parseFloat(point.ele?.[0]) || 0;
      
      if (previousPoint) {
        // Haversine distance calculation
        const distance = calculateHaversineDistance(
          previousPoint.lat, previousPoint.lon, lat, lon
        );
        totalDistance += distance;
        
        // Elevation gain
        if (ele > previousPoint.ele) {
          elevationGain += ele - previousPoint.ele;
        }
      }
      
      // Heart rate from extensions
      const hr = point.extensions?.[0]?.['gpxtpx:TrackPointExtension']?.[0]?.['gpxtpx:hr']?.[0];
      if (hr) heartRates.push(parseInt(hr));
      
      previousPoint = { lat, lon, ele };
    }
    
    const duration = startTime && endTime 
      ? Math.round((endTime - startTime) / 1000 / 60) 
      : 0;
    
    const avgHeartRate = heartRates.length > 0 
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null;
    
    const pace = totalDistance > 0 && duration > 0
      ? duration / totalDistance
      : null;
    
    return {
      workouts: [{
        title: track?.name?.[0] || 'GPX Import',
        date: startTime,
        distance: Math.round(totalDistance * 100) / 100,
        duration,
        pace: pace ? Math.round(pace * 100) / 100 : null,
        elevation: Math.round(elevationGain),
        avgHeartRate
      }]
    };
  } catch (error) {
    console.error('GPX Parsing Error:', error);
    throw new Error('Failed to parse GPX file');
  }
};

// Parse CSV file - now handles multiple rows as separate workouts
export const parseCSV = async (filepath) => {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    // Parse headers - normalize them
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/['"]/g, ''));
    
    // Map common header variations
    const headerMap = {
      'date': ['date', 'workout_date', 'activity_date', 'time'],
      'title': ['title', 'name', 'activity', 'workout', 'workout_name', 'activity_name'],
      'duration': ['duration', 'time', 'minutes', 'duration_minutes', 'elapsed_time', 'total_time'],
      'distance': ['distance', 'km', 'kilometers', 'miles', 'dist'],
      'pace': ['pace', 'avg_pace', 'average_pace', 'min_per_km'],
      'elevation': ['elevation', 'elev', 'elevation_gain', 'ascent', 'gain'],
      'heart_rate': ['heart_rate', 'hr', 'avg_hr', 'avg_heart_rate', 'average_heart_rate', 'avg_heartrate'],
      'calories': ['calories', 'cal', 'kcal', 'energy']
    };
    
    // Find which headers match
    const findHeader = (variations) => {
      for (const v of variations) {
        const idx = headers.indexOf(v);
        if (idx !== -1) return idx;
      }
      return -1;
    };
    
    const indices = {
      date: findHeader(headerMap.date),
      title: findHeader(headerMap.title),
      duration: findHeader(headerMap.duration),
      distance: findHeader(headerMap.distance),
      pace: findHeader(headerMap.pace),
      elevation: findHeader(headerMap.elevation),
      heart_rate: findHeader(headerMap.heart_rate),
      calories: findHeader(headerMap.calories)
    };
    
    // Parse each data row as a workout
    const workouts = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle CSV with quoted values
      const values = parseCSVLine(line);
      
      const getValue = (idx) => idx >= 0 && values[idx] ? values[idx].trim().replace(/['"]/g, '') : null;
      
      const dateStr = getValue(indices.date);
      let date = new Date();
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          date = parsed;
        }
      }
      
      const workout = {
        title: getValue(indices.title) || `Imported Workout ${i}`,
        date,
        duration: parseInt(getValue(indices.duration)) || 0,
        distance: parseFloat(getValue(indices.distance)) || 0,
        pace: parseFloat(getValue(indices.pace)) || null,
        elevation: parseFloat(getValue(indices.elevation)) || 0,
        avgHeartRate: parseInt(getValue(indices.heart_rate)) || null,
        calories: parseInt(getValue(indices.calories)) || null
      };
      
      workouts.push(workout);
    }
    
    if (workouts.length === 0) {
      throw new Error('No valid workout data found in CSV');
    }
    
    return { workouts };
  } catch (error) {
    console.error('CSV Parsing Error:', error);
    throw new Error('Failed to parse CSV file: ' + error.message);
  }
};

// Parse a CSV line handling quoted values
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  
  return values;
}

// Haversine formula for distance calculation
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}
