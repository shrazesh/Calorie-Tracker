import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';
import { Calendar, TrendingUp, Award, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e'];

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [daily, weekly, monthly] = await Promise.all([
        api.get('/report/daily'),
        api.get('/report/weekly'),
        api.get('/report/monthly')
      ]);
      setDailyData(daily.data);
      setWeeklyData(weekly.data);
      setMonthlyData(monthly.data);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    const data = activeTab === 'weekly' ? weeklyData : monthlyData;
    if (!data?.dailyData) return;

    const rows = [['Date', 'Calories', 'Entries']];
    Object.entries(data.dailyData).forEach(([date, d]) => {
      rows.push([date, d.calories, d.entries]);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorie-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const calorieGoal = user?.calorieGoal || 2000;

  // Weekly chart data
  const weeklyChartData = weeklyData?.dailyData
    ? Object.entries(weeklyData.dailyData).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
        calories: data.calories,
        goal: calorieGoal
      }))
    : [];

  // Monthly chart data
  const monthlyChartData = monthlyData?.dailyData
    ? Object.entries(monthlyData.dailyData).map(([date, data]) => ({
        date: new Date(date).getDate(),
        calories: data.calories,
        goal: calorieGoal
      }))
    : [];

  // Category pie data
  const getCategoryPieData = (data) => {
    if (!data?.categoryBreakdown) return [];
    return Object.entries(data.categoryBreakdown).map(([name, value]) => ({ name, value }));
  };

  const activeData = activeTab === 'daily' ? dailyData : activeTab === 'weekly' ? weeklyData : monthlyData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Detailed insights into your nutrition patterns</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 w-fit">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 bg-surface-100 dark:bg-surface-800 rounded-xl p-1 w-fit">
        {['daily', 'weekly', 'monthly'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab
                ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{(activeData?.totalCalories || 0).toLocaleString()}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Total Calories</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{activeData?.avgCalories || activeData?.totalCalories || 0}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Avg Calories/Day</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{activeData?.daysTracked || (activeData?.entryCount > 0 ? 1 : 0)}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Days Tracked</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-surface-900 dark:text-white">{activeData?.totalEntries || activeData?.entryCount || 0}</p>
          <p className="text-sm text-surface-500 dark:text-surface-400">Total Entries</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
            {activeTab === 'daily' ? 'Today\'s Intake' : activeTab === 'weekly' ? 'Weekly Trend' : 'Monthly Trend'}
          </h3>
          <div className="h-80">
            {activeTab === 'daily' ? (
              dailyData?.entries?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData.entries.map(e => ({ name: e.foodName.slice(0, 12), calories: e.calories, category: e.category }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="calories" fill="url(#dailyGradient)" radius={[8, 8, 0, 0]} />
                    <defs>
                      <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-surface-400">No entries today</div>
              )
            ) : activeTab === 'weekly' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Area type="monotone" dataKey="calories" stroke="#22c55e" fill="url(#areaGrad)" strokeWidth={3} />
                  <Line type="monotone" dataKey="goal" stroke="#e2e8f0" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="goal" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Category Breakdown</h3>
          {getCategoryPieData(activeData).length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={getCategoryPieData(activeData)} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={5} dataKey="value">
                      {getCategoryPieData(activeData).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {getCategoryPieData(activeData).map((entry, i) => {
                  const total = getCategoryPieData(activeData).reduce((s, e) => s + e.value, 0);
                  const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm text-surface-600 dark:text-surface-400">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-surface-900 dark:text-white">{entry.value} cal</span>
                        <span className="text-xs text-surface-400 ml-2">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-surface-400">No data available</div>
          )}
        </div>
      </div>

      {/* Weekly Trends (Monthly view) */}
      {activeTab === 'monthly' && monthlyData?.weeklyTrends && (
        <div className="glass-card-solid p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Weekly Trends This Month</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyData.weeklyTrends.map((week) => (
              <div key={week.week} className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 border border-surface-100 dark:border-surface-700">
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-2">Week {week.week}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white">{week.calories.toLocaleString()}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                  {week.entries} entries • Avg: {week.avg} cal/day
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
