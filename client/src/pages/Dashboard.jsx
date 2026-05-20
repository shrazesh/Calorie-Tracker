import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, Target, TrendingUp, Utensils, AlertTriangle, Lightbulb, ArrowRight, Zap, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import SetupProfileModal from '../components/SetupProfileModal';
import TodayMacroProgress from '../components/TodayMacroProgress';

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e'];

export default function Dashboard() {
  const { user, fetchProfile } = useAuth();
  const [report, setReport] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [recommendData, setRecommendData] = useState(null);
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Show setup modal if profile not yet complete
  useEffect(() => {
    if (user && user.profileComplete === false) {
      setShowSetup(true);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [dailyRes, weeklyRes, recRes, macroRes] = await Promise.all([
        api.get('/report/daily'),
        api.get('/report/weekly'),
        api.get('/recommendations'),
        api.get('/nutrition/today-macros')
      ]);
      setReport(dailyRes.data);
      setWeeklyData(weeklyRes.data);
      setRecommendData(recRes.data);
      setMacroData(macroRes.data);
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const calorieGoal = user?.dailyCalorieGoal || user?.calorieGoal || 2000;
  const todayCalories = report?.totalCalories || 0;
  const remaining = calorieGoal - todayCalories;
  const percentage = Math.min(Math.round((todayCalories / calorieGoal) * 100), 100);
  const isOver = todayCalories > calorieGoal;

  // Format weekly chart data
  const chartData = weeklyData?.dailyData
    ? Object.entries(weeklyData.dailyData).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: data.calories,
        goal: calorieGoal
      }))
    : [];

  // Pie chart data
  const pieData = report?.categoryBreakdown
    ? Object.entries(report.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const getDeficitMessage = (deficit) => {
    if (!deficit) return null;
    const messages = [];
    if (deficit.protein > 20) {
      messages.push(`protein (${deficit.protein}g remaining)`);
    }
    if (deficit.carbs > 30) {
      messages.push(`carbs (${deficit.carbs}g remaining)`);
    }
    if (deficit.fat > 15) {
      messages.push(`fat (${deficit.fat}g remaining)`);
    }
    if (messages.length === 0) return "Your macro targets are completely on track today! Keep up the amazing work! 🎉";
    return `You are currently low on: ${messages.join(', ')}. Try adding the recommended foods below to hit your optimal macro balance!`;
  };

  const handleSetupComplete = async () => {
    setShowSetup(false);
    await fetchProfile();
    fetchDashboardData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {showSetup && <SetupProfileModal onComplete={handleSetupComplete} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Here's your nutrition overview for today</p>
        </div>
        <div className="text-sm text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-4 py-2 rounded-xl">
          📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Alerts */}
      {recommendData?.alerts?.map((alert, i) => (
        <div key={i} className={`flex items-center gap-3 p-4 rounded-xl animate-slide-up ${
          alert.type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${alert.type === 'warning' ? 'text-amber-500' : 'text-blue-500'}`} />
          <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'}`}>
            {alert.message}
          </p>
        </div>
      ))}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories Today */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isOver ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'}`}>
              {percentage}%
            </span>
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{todayCalories.toLocaleString()}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Calories consumed</p>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full progress-bar transition-all duration-1000 ${isOver ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-primary-500 to-emerald-400'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Remaining */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className={`text-3xl font-bold ${isOver ? 'text-red-500' : 'text-surface-900 dark:text-white'}`}>
            {isOver ? '+' : ''}{Math.abs(remaining).toLocaleString()}
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            {isOver ? 'Over goal' : 'Remaining today'}
          </p>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">Goal: {calorieGoal.toLocaleString()} cal</p>
        </div>

        {/* Weekly Average */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{(weeklyData?.avgCalories || 0).toLocaleString()}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Weekly average</p>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">{weeklyData?.daysTracked || 0} days tracked</p>
        </div>

        {/* Today's Meals */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Utensils className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-surface-900 dark:text-white">{report?.entryCount || 0}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Meals logged today</p>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-2">{weeklyData?.totalEntries || 0} this week</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-2 glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Weekly Calorie Intake</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-surface-700" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="calories" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="goal" fill="#e2e8f0" radius={[8, 8, 0, 0]} opacity={0.3} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Today by Category</h3>
          {pieData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-surface-400 dark:text-surface-500">
              <p className="text-center">No meals logged today.<br />Start tracking! 🍽️</p>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {pieData.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-surface-600 dark:text-surface-400">{entry.name}</span>
                </div>
                <span className="font-semibold text-surface-900 dark:text-white">{entry.value} cal</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Macro Progress Section */}
      <TodayMacroProgress data={macroData} />

      {/* Real-time Macro Deficit and USDA Recommendations */}
      {recommendData && (
        <div className="glass-card-solid p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Lightbulb className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Smart USDA Macro Recommendation Engine</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">Optimization-based mathematical scoring of USDA datasets</p>
            </div>
          </div>

          {/* Why these foods explanation section */}
          <div className="mb-6 p-5 bg-primary-50/50 dark:bg-primary-950/10 rounded-2xl border border-primary-100/50 dark:border-primary-900/20">
            <h4 className="text-sm font-bold text-primary-900 dark:text-primary-300 mb-2">🤔 Why these foods?</h4>
            <p className="text-xs text-primary-700 dark:text-primary-400 leading-relaxed">
              Our true optimization-based recommendation engine runs a live scoring algorithm across all foods in our database. It prioritizes covering your specific macro deficit (giving <strong>50% weight to Protein</strong>, <strong>30% to Carbs</strong>, and <strong>20% to Fats</strong>), penalizes items with excessive calorie densities to prevent unwanted surplus, and rewards nutrient-rich foods with higher health ratings. This ensures you get the most nutritionally efficient options to hit your daily targets!
            </p>
          </div>

          {/* Live Alert Deficit Card */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/30 mb-6">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                {getDeficitMessage(recommendData.deficit)}
              </p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">
            Top Deficit-Fixing Foods (Direct USDA Database Matches)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendData.recommendedFoods?.map((food, i) => {
              const pDeficit = Math.max(1, recommendData.deficit?.protein || 0);
              const pPercent = Math.min(Math.round(((food.protein_g || 0) / pDeficit) * 100), 100);

              return (
                <div 
                  key={i} 
                  className="bg-surface-50 dark:bg-surface-800/40 rounded-2xl p-4 border border-surface-200 dark:border-surface-700/60 shadow-sm hover:shadow-md hover:border-primary-400 dark:hover:border-primary-850 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30">
                        USDA Match
                      </span>
                      <span className="text-[10px] font-bold text-surface-400 dark:text-surface-500">
                        Score: {food.recommendationScore}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-surface-900 dark:text-white text-sm line-clamp-2 capitalize min-h-[2.5rem]">
                      {food.name.toLowerCase()}
                    </h4>
                    <p className="text-[11px] font-semibold text-primary-500 mt-1">
                      🎯 Best match for your deficit
                    </p>
                  </div>

                  {/* Protein Match Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-surface-500 dark:text-surface-400 font-bold mb-1">
                      <span>Protein Match:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{pPercent}%</span>
                    </div>
                    <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${pPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-surface-600 dark:text-surface-400">
                    <div className="flex justify-between border-b border-surface-100 dark:border-surface-700/40 pb-1">
                      <span>Calories:</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{food.calories_per_100g} kcal</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-100 dark:border-surface-700/40 pb-1">
                      <span>Protein:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{food.protein_g}g</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-100 dark:border-surface-700/40 pb-1">
                      <span>Carbs:</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{food.carbs_g}g</span>
                    </div>
                    <div className="flex justify-between border-b border-surface-100 dark:border-surface-700/40 pb-1">
                      <span>Fat:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{food.fats_g}g</span>
                    </div>
                    {food.fiber_g !== undefined && (
                      <div className="flex justify-between">
                        <span>Fiber:</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{food.fiber_g}g</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TDEE Info */}
      {user?.profileComplete && (
        <div className="glass-card-solid p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Your Energy Profile</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">Based on your body metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{user.bmr}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">BMR (cal/day)</p>
            </div>
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.tdee}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">TDEE (cal/day)</p>
            </div>
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{calorieGoal}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Your Goal</p>
            </div>
            <div className="text-center p-4 bg-surface-50 dark:bg-surface-900/50 rounded-xl">
              <p className="text-2xl font-bold text-surface-900 dark:text-white capitalize">{user.activityLevel?.replace('_', ' ')}</p>
              <p className="text-xs text-surface-500 dark:text-surface-400">Activity Level</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
