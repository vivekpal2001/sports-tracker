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
        title: track?.name?.[0] || 'GPX Import',
        distance: 0,
        duration: 0
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
      title: track?.name?.[0] || 'GPX Import',
      date: startTime,
      distance: Math.round(totalDistance * 100) / 100,
      duration,
      pace: pace ? Math.round(pace * 100) / 100 : null,
      elevation: Math.round(elevationGain),
      avgHeartRate
    };
  } catch (error) {
    console.error('GPX Parsing Error:', error);
    throw new Error('Failed to parse GPX file');
  }
};

// Parse CSV file (assumes standard format with headers)
export const parseCSV = async (filepath) => {
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file is empty or has no data rows');
    }
    
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i]?.trim();
      });
      return row;
    });
    
    // Try to extract common fields
    const firstRow = data[0];
    
    return {
      title: firstRow.title || firstRow.name || 'CSV Import',
      date: firstRow.date ? new Date(firstRow.date) : new Date(),
      distance: parseFloat(firstRow.distance) || 0,
      duration: parseInt(firstRow.duration) || 0,
      avgHeartRate: parseInt(firstRow.heart_rate || firstRow.hr) || null,
      elevation: parseFloat(firstRow.elevation) || 0,
      rawData: data
    };
  } catch (error) {
    console.error('CSV Parsing Error:', error);
    throw new Error('Failed to parse CSV file');
  }
};

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
