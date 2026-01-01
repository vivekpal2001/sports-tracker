import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity,
  Calendar,
  Clock,
  Flame,
  Target
} from 'lucide-react';
import {
  VictoryChart,
  VictoryBar,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryPie,
  VictoryTooltip,
  VictoryVoronoiContainer,
  VictoryLegend,
  VictoryGroup
} from 'victory';
import { Card, AnimatedCounter, LoadingSpinner } from '../components/ui';
import { workoutAPI, aiAPI } from '../services/api';
import CalendarHeatmap from '../components/CalendarHeatmap';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [period]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, weeklyRes] = await Promise.all([
        workoutAPI.getStats(period),
        aiAPI.weeklySummary()
      ]);
      
      setStats(statsRes.data.data);
      setWeeklyData(weeklyRes.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }
  
  // Generate chart data - pass period for proper formatting
  const activityData = generateActivityData(weeklyData?.workouts || [], period);
  const typeDistribution = getTypeDistribution(stats?.byType || []);
  const weeklyTrend = generateWeeklyTrend();
  
  const totalWorkouts = stats?.byType?.reduce((sum, t) => sum + t.count, 0) || 0;
  const totalDuration = stats?.byType?.reduce((sum, t) => sum + (t.totalDuration || 0), 0) || 0;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-gray-400">Track your progress over time</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${period === p.id 
                  ? 'bg-primary-500 text-dark-500' 
                  : 'bg-dark-200/50 text-gray-400 hover:text-white'}
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workouts', value: totalWorkouts, icon: Activity, color: 'primary' },
          { label: 'Training Hours', value: (totalDuration / 60).toFixed(1), icon: Clock, color: 'lime', suffix: 'h' },
          { label: 'Current Streak', value: stats?.streak || 0, icon: Flame, color: 'orange', suffix: ' days' },
          { label: 'Distance', value: stats?.running?.totalDistance?.toFixed(1) || 0, icon: TrendingUp, color: 'crimson', suffix: ' km' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <div className={`
                w-10 h-10 rounded-xl mb-3 flex items-center justify-center
                ${stat.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                ${stat.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                ${stat.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                ${stat.color === 'crimson' ? 'bg-crimson-500/20 text-crimson-500' : ''}
              `}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter value={parseFloat(stat.value)} suffix={stat.suffix || ''} decimals={stat.value % 1 !== 0 ? 1 : 0} />
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">
            {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly'} Activity
          </h3>
          <div className="h-64">
            <VictoryChart
              containerComponent={
                <VictoryVoronoiContainer
                  labels={({ datum }) => `${datum.y} min`}
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{ fill: '#1f1f2e', stroke: '#00d4ff' }}
                      style={{ fill: '#fff', fontSize: 12 }}
                    />
                  }
                />
              }
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
            >
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <VictoryAxis
                tickFormat={(t) => {
                  if (period === 'week') {
                    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][t - 1] || '';
                  } else if (period === 'month') {
                    return t % 5 === 0 || t === 1 ? `${t}` : '';
                  } else {
                    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][t - 1] || '';
                  }
                }}
                style={{
                  axis: { stroke: 'transparent' },
                  tickLabels: { fill: '#9ca3af', fontSize: 11 },
                  grid: { stroke: 'rgba(255,255,255,0.05)' }
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: 'transparent' },
                  tickLabels: { fill: '#9ca3af', fontSize: 11 },
                  grid: { stroke: 'rgba(255,255,255,0.05)' }
                }}
              />
              <VictoryArea
                data={activityData}
                style={{
                  data: { 
                    fill: 'url(#areaGradient)',
                    stroke: '#00d4ff',
                    strokeWidth: 2
                  }
                }}
                animate={{ duration: 1000 }}
              />
            </VictoryChart>
          </div>
        </Card>
        
        {/* Workout Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Workout Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <VictoryPie
              data={typeDistribution}
              colorScale={['#84ff00', '#ff6b00', '#00d4ff', '#ff3366']}
              innerRadius={60}
              labelRadius={85}
              style={{ 
                labels: { fill: '#fff', fontSize: 12 },
                data: { stroke: '#0a0a0f', strokeWidth: 2 }
              }}
              animate={{ duration: 1000 }}
              width={300}
              height={250}
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {typeDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ['#84ff00', '#ff6b00', '#00d4ff', '#ff3366'][i] }}
                />
                <span className="text-sm text-gray-400">{item.x}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* Training Load Trend */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Training Load Trend</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-gray-400">Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-lime-500" />
              <span className="text-gray-400">Intensity</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <VictoryChart
            padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
          >
            <VictoryAxis
              tickFormat={(t) => `Week ${t}`}
              style={{
                axis: { stroke: 'transparent' },
                tickLabels: { fill: '#9ca3af', fontSize: 11 },
                grid: { stroke: 'rgba(255,255,255,0.05)' }
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'transparent' },
                tickLabels: { fill: '#9ca3af', fontSize: 11 },
                grid: { stroke: 'rgba(255,255,255,0.05)' }
              }}
            />
            <VictoryGroup offset={20}>
              <VictoryBar
                data={weeklyTrend.duration}
                style={{ data: { fill: '#00d4ff', width: 15 } }}
                animate={{ duration: 500 }}
              />
              <VictoryBar
                data={weeklyTrend.intensity}
                style={{ data: { fill: '#84ff00', width: 15 } }}
                animate={{ duration: 500 }}
              />
            </VictoryGroup>
          </VictoryChart>
        </div>
      </Card>
      
      {/* Training Calendar Heatmap */}
      <CalendarHeatmap />
    </div>
  );
}

// Helper functions
function generateActivityData(workouts, period = 'week') {
  if (period === 'week') {
    const days = [1, 2, 3, 4, 5, 6, 7];
    return days.map(day => {
      const dayWorkouts = workouts.filter(w => {
        const d = new Date(w.date).getDay();
        return (d === 0 ? 7 : d) === day;
      });
      const totalDuration = dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      return { x: day, y: totalDuration };
    });
  } else if (period === 'month') {
    // Generate 30 days of data
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    return days.map(day => {
      const dayWorkouts = workouts.filter(w => new Date(w.date).getDate() === day);
      const totalDuration = dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      return { x: day, y: totalDuration };
    });
  } else {
    // Year - show monthly totals
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map(month => {
      const monthWorkouts = workouts.filter(w => new Date(w.date).getMonth() + 1 === month);
      const totalDuration = monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      return { x: month, y: totalDuration };
    });
  }
}

function getTypeDistribution(byType) {
  const typeLabels = { run: 'Run', lift: 'Lift', cardio: 'Cardio', yoga: 'Yoga', biometrics: 'Bio' };
  const distribution = byType
    .filter(t => t._id !== 'biometrics')
    .map(t => ({
      x: typeLabels[t._id] || t._id,
      y: t.count
    }));
  
  // Return empty placeholder if no data
  if (distribution.length === 0) {
    return [{ x: 'No Data', y: 1 }];
  }
  
  return distribution;
}

function generateWeeklyTrend() {
  // Return empty data - actual trend should be computed from real workouts
  return {
    duration: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 }
    ],
    intensity: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 }
    ]
  };
}
