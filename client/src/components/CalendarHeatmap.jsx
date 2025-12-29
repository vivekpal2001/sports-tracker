import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Flame, Clock, TrendingUp } from 'lucide-react';
import { workoutAPI } from '../services/api';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarHeatmap() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [heatmapData, setHeatmapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  useEffect(() => {
    fetchMonthData();
  }, [year, month]);
  
  const fetchMonthData = async () => {
    setLoading(true);
    try {
      const res = await workoutAPI.getChartData({ 
        period: 'custom', 
        year, 
        month: month + 1 // API expects 1-indexed month
      });
      
      // Convert heatmap data to a day lookup
      // Parse day directly from date string (YYYY-MM-DD) to avoid timezone issues
      const dayData = {};
      (res.data.data.daily || []).forEach(d => {
        // d.date is in format "YYYY-MM-DD", extract day directly
        const day = parseInt(d.date.split('-')[2], 10);
        dayData[day] = {
          workouts: d.workouts || 0,
          duration: d.duration || 0,
          distance: d.distance || 0
        };
      });
      
      setHeatmapData(dayData);
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error);
      setHeatmapData({});
    } finally {
      setLoading(false);
    }
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  // Build calendar weeks
  const weeks = [];
  let dayCounter = 1;
  let nextMonthDay = 1;
  
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    
    for (let day = 0; day < 7; day++) {
      if (week === 0 && day < firstDayOfMonth) {
        // Previous month days
        const prevDay = daysInPrevMonth - firstDayOfMonth + day + 1;
        weekDays.push({ day: prevDay, isCurrentMonth: false, isToday: false });
      } else if (dayCounter > daysInMonth) {
        // Next month days
        weekDays.push({ day: nextMonthDay++, isCurrentMonth: false, isToday: false });
      } else {
        // Current month days
        const today = new Date();
        const isToday = 
          dayCounter === today.getDate() && 
          month === today.getMonth() && 
          year === today.getFullYear();
        
        const dayInfo = heatmapData[dayCounter] || { workouts: 0, duration: 0, distance: 0 };
        weekDays.push({ 
          day: dayCounter, 
          isCurrentMonth: true, 
          isToday,
          ...dayInfo
        });
        dayCounter++;
      }
    }
    
    weeks.push(weekDays);
    
    // Stop if we've completed the month and filled the week
    if (dayCounter > daysInMonth && weeks.length >= 4) {
      break;
    }
  }
  
  const getIntensityClass = (workouts) => {
    if (!workouts || workouts === 0) return 'bg-dark-300';
    if (workouts === 1) return 'bg-primary-500/30';
    if (workouts === 2) return 'bg-primary-500/50';
    if (workouts === 3) return 'bg-primary-500/70';
    return 'bg-primary-500';
  };
  
  const isCurrentMonthView = () => {
    const now = new Date();
    return month === now.getMonth() && year === now.getFullYear();
  };
  
  return (
    <div className="bg-dark-200/50 rounded-2xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-white">Training Calendar</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-white font-medium min-w-[150px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            disabled={isCurrentMonthView()}
          >
            <ChevronRight className={`w-5 h-5 ${isCurrentMonthView() ? 'opacity-30' : ''}`} />
          </button>
          
          {!isCurrentMonthView() && (
            <button
              onClick={goToCurrentMonth}
              className="ml-2 px-3 py-1 text-sm rounded-lg bg-primary-500/20 text-primary-500 hover:bg-primary-500/30 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="space-y-1">
        {loading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1">
              {week.map((dayInfo, dayIdx) => (
                <motion.div
                  key={dayIdx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                  className="relative group"
                  onMouseEnter={() => dayInfo.isCurrentMonth && dayInfo.workouts > 0 && setHoveredDay(dayInfo.day)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <button
                    onClick={() => dayInfo.isCurrentMonth && setSelectedDay(selectedDay === dayInfo.day ? null : dayInfo.day)}
                    className={`
                      w-full aspect-square rounded-lg flex flex-col items-center justify-center
                      transition-all border-2
                      ${!dayInfo.isCurrentMonth ? 'text-gray-600 opacity-30 cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-white/20'}
                      ${dayInfo.isToday ? 'border-primary-500' : 'border-transparent'}
                      ${selectedDay === dayInfo.day ? 'ring-2 ring-lime-500' : ''}
                      ${dayInfo.isCurrentMonth ? getIntensityClass(dayInfo.workouts) : 'bg-transparent'}
                    `}
                  >
                    <span className={`text-sm ${dayInfo.isToday ? 'text-primary-500 font-bold' : dayInfo.isCurrentMonth ? 'text-white' : 'text-gray-600'}`}>
                      {dayInfo.day}
                    </span>
                    {dayInfo.isCurrentMonth && dayInfo.workouts > 0 && (
                      <span className="text-[10px] text-gray-300">
                        {dayInfo.workouts}
                      </span>
                    )}
                  </button>
                  
                  {/* Hover Tooltip */}
                  <AnimatePresence>
                    {hoveredDay === dayInfo.day && dayInfo.workouts > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none"
                      >
                        <div className="bg-dark-400 border border-white/20 rounded-lg px-3 py-2 shadow-xl min-w-[140px]">
                          <p className="text-white font-medium text-sm mb-2 text-center">
                            {MONTH_NAMES[month]} {dayInfo.day}
                          </p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span>{dayInfo.workouts} workout{dayInfo.workouts !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Clock className="w-3 h-3 text-primary-500" />
                              <span>{dayInfo.duration} min</span>
                            </div>
                            {dayInfo.distance > 0 && (
                              <div className="flex items-center gap-2 text-gray-300">
                                <TrendingUp className="w-3 h-3 text-lime-500" />
                                <span>{dayInfo.distance.toFixed(1)} km</span>
                              </div>
                            )}
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-400" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ))
        )}
      </div>
      
      {/* Selected Day Details */}
      {selectedDay && heatmapData[selectedDay] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-dark-300/50 border border-white/10"
        >
          <h4 className="text-white font-medium mb-2">
            {MONTH_NAMES[month]} {selectedDay}, {year}
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Workouts</p>
              <p className="text-white font-bold text-lg">{heatmapData[selectedDay].workouts}</p>
            </div>
            <div>
              <p className="text-gray-400">Duration</p>
              <p className="text-white font-bold text-lg">{heatmapData[selectedDay].duration} min</p>
            </div>
            <div>
              <p className="text-gray-400">Distance</p>
              <p className="text-white font-bold text-lg">{heatmapData[selectedDay].distance?.toFixed(1) || 0} km</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-500">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-4 h-4 rounded-sm ${getIntensityClass(level)}`}
          />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  );
}
