import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Flame,
  ChevronRight,
  Zap,
  Brain,
  FileDown
} from 'lucide-react';
import { 
  VictoryChart, 
  VictoryArea, 
  VictoryAxis, 
  VictoryTooltip,
  VictoryVoronoiContainer 
} from 'victory';
import { 
  Card, 
  CircularProgress, 
  AnimatedCounter, 
  TypeWriter,
  LoadingSpinner
} from '../components/ui';
import { workoutAPI, aiAPI, exportAPI } from '../services/api';
import RecoveryScoreCard from '../components/RecoveryScoreCard';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('week');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    fetchChartData(chartPeriod);
  }, [chartPeriod]);
  
  const fetchData = async () => {
    try {
      const [statsRes, workoutsRes, aiRes] = await Promise.all([
        workoutAPI.getStats('week'),
        workoutAPI.getAll({ limit: 5 }),
        aiAPI.analyze()
      ]);
      
      setStats(statsRes.data.data);
      setWorkouts(workoutsRes.data.data);
      setAiInsights(aiRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchChartData = async (period) => {
    try {
      const res = await workoutAPI.getChartData({ period });
      const daily = res.data.data.daily || [];
      
      // Convert to chart format with x,y for Victory
      // Group by day of week for weekly view
      if (period === 'week') {
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayMap = {};
        
        daily.forEach(d => {
          const dayOfWeek = new Date(d.date).getDay();
          if (!dayMap[dayOfWeek]) {
            dayMap[dayOfWeek] = { duration: 0, workouts: 0 };
          }
          dayMap[dayOfWeek].duration += d.duration;
          dayMap[dayOfWeek].workouts += d.workouts;
        });
        
        // Create data for all 7 days
        const chartPoints = [];
        for (let i = 1; i <= 7; i++) {
          const dayIdx = i === 7 ? 0 : i; // Sunday is 0
          chartPoints.push({
            x: i,
            y: dayMap[dayIdx]?.duration || 0,
            label: weekDays[dayIdx]
          });
        }
        setChartData(chartPoints);
      } else {
        // For month/year, show daily values
        const chartPoints = daily.map((d, i) => ({
          x: i + 1,
          y: d.duration || 0,
          label: d.date
        }));
        setChartData(chartPoints.length > 0 ? chartPoints : [{ x: 1, y: 0 }]);
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
      setChartData([{ x: 1, y: 0 }]);
    }
  };
  
  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const response = await exportAPI.trainingPlan();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `training-plan-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading your performance data..." />
      </div>
    );
  }
  
  const performanceScore = aiInsights?.performanceScore ?? 0;
  const hasWorkouts = workouts.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Performance Dashboard</h1>
          <p className="text-gray-400">Your training overview for this week</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/20 text-primary-500 hover:bg-primary-500/30 transition-all"
        >
          <FileDown className="w-5 h-5" />
          {exporting ? 'Exporting...' : 'Export Training Plan'}
        </motion.button>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Score Card */}
        <Card glow className="lg:row-span-2 flex flex-col items-center justify-center py-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">AI Performance Score</h3>
          <CircularProgress 
            value={performanceScore} 
            size={180} 
            strokeWidth={12}
            label="/ 100"
          />
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">
              {performanceScore >= 80 ? 'Excellent' : performanceScore >= 60 ? 'Good' : 'Needs Work'}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-lime-500" />
                <span className="text-gray-400">Consistency</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-gray-400">Intensity</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Workouts', 
              value: stats?.byType?.reduce((sum, t) => sum + ((t._id !== 'biometrics' && t.type !== 'biometrics') ? t.count : 0), 0) || 0,
              icon: Activity,
              color: 'primary',
              suffix: ''
            },
            { 
              label: 'Distance', 
              value: stats?.totalDistance || 0,  // Now includes both running and cardio
              icon: TrendingUp,
              color: 'lime',
              suffix: ' km',
              decimals: 1
            },
            { 
              label: 'Training Time', 
              value: stats?.byType?.reduce((sum, t) => sum + (t.totalDuration || 0), 0) || 0,
              icon: Clock,
              color: 'orange',
              suffix: ' min'
            },
            { 
              label: 'Day Streak', 
              value: stats?.streak || 0,
              icon: Flame,
              color: 'crimson',
              suffix: ''
            },
          ].map((stat, i) => (
            <Card key={i} className="flex flex-col">
              <div className={`
                w-10 h-10 rounded-xl mb-3 flex items-center justify-center
                ${stat.color === 'primary' ? 'bg-primary-500/20 text-primary-500' : ''}
                ${stat.color === 'lime' ? 'bg-lime-500/20 text-lime-500' : ''}
                ${stat.color === 'orange' ? 'bg-orange-500/20 text-orange-500' : ''}
                ${stat.color === 'crimson' ? 'bg-crimson-500/20 text-crimson-500' : ''}
              `}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <span className="text-2xl font-bold text-white">
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                />
              </span>
            </Card>
          ))}
        </div>
        
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {chartPeriod === 'week' ? 'Weekly' : chartPeriod === 'month' ? 'Monthly' : 'Yearly'} Activity
            </h3>
            <select 
              className="bg-dark-200 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-300"
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
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
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <VictoryAxis
                tickFormat={(t) => {
                  if (chartPeriod === 'week') {
                    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][t - 1] || '';
                  } else if (chartPeriod === 'month') {
                    return t % 5 === 0 || t === 1 ? `${t}` : '';
                  } else {
                    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][t - 1] || '';
                  }
                }}
                style={{
                  axis: { stroke: 'transparent' },
                  tickLabels: { fill: '#9ca3af', fontSize: 12 },
                  grid: { stroke: 'rgba(255,255,255,0.05)' }
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: 'transparent' },
                  tickLabels: { fill: '#9ca3af', fontSize: 12 },
                  grid: { stroke: 'rgba(255,255,255,0.05)' }
                }}
              />
              <VictoryArea
                data={chartData}
                style={{
                  data: { 
                    fill: 'url(#chartGradient)',
                    stroke: '#00d4ff',
                    strokeWidth: 2
                  }
                }}
                animate={{ duration: 1000 }}
              />
            </VictoryChart>
          </div>
        </Card>
      </div>
      
      {/* Recovery Score & AI Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Score */}
        <RecoveryScoreCard />
        
        {/* AI Insights Card */}
        <Card glow className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-lime-500 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6 text-dark-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              AI Insight
              <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-500 text-xs">
                New
              </span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {hasWorkouts ? (
                <TypeWriter 
                  text={aiInsights?.summary || "Analyzing your training data..."}
                  speed={20}
                />
              ) : (
                "Start logging workouts to receive personalized AI insights about your training!"
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(aiInsights?.recommendations?.slice(0, 3) || []).map((rec, i) => (
                <span 
                  key={i}
                  className="px-3 py-1 rounded-full bg-dark-200/50 text-sm text-gray-300 border border-white/5"
                >
                  {rec.title}
                </span>
              ))}
            </div>
            <Link 
              to="/dashboard/insights"
              className="inline-flex items-center gap-1 mt-4 text-primary-500 hover:text-primary-400 text-sm font-medium"
            >
              View all insights
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Card>
      </div>
      
      {/* Recent Workouts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Workouts</h3>
          <Link 
            to="/dashboard/workouts"
            className="text-primary-500 hover:text-primary-400 text-sm font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="space-y-3">
          {workouts.length > 0 ? (
            workouts.map((workout, i) => (
              <motion.div
                key={workout._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card hover={false} className="flex items-center gap-4 py-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${workout.type === 'run' ? 'bg-lime-500/20 text-lime-500' : ''}
                    ${workout.type === 'lift' ? 'bg-orange-500/20 text-orange-500' : ''}
                    ${workout.type === 'cardio' ? 'bg-primary-500/20 text-primary-500' : ''}
                    ${workout.type === 'biometrics' ? 'bg-crimson-500/20 text-crimson-500' : ''}
                  `}>
                    {workout.type === 'run' && <Activity className="w-5 h-5" />}
                    {workout.type === 'lift' && <Zap className="w-5 h-5" />}
                    {workout.type === 'cardio' && <Activity className="w-5 h-5" />}
                    {workout.type === 'biometrics' && <Calendar className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{workout.title}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(workout.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {workout.duration && ` • ${workout.duration} min`}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {workout.type === 'run' && workout.run?.distance && (
                      <span className="text-lg font-bold text-white">{workout.run.distance.toFixed(1)} km</span>
                    )}
                    {workout.type === 'cardio' && workout.cardio?.distance && (
                      <span className="text-lg font-bold text-white">{workout.cardio.distance.toFixed(1)} km</span>
                    )}
                    {workout.rpe && (
                      <p className="text-sm text-gray-400">RPE: {workout.rpe}</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-white mb-2">No workouts yet</h4>
              <p className="text-gray-400 mb-4">Start logging your first workout to see your progress!</p>
              <Link to="/dashboard/log-workout">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-xl bg-primary-500 text-dark-500 font-medium"
                >
                  Log Your First Workout
                </motion.button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
