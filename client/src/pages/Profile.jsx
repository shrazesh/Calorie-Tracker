import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Target, Scale, Ruler, Activity, Save, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tdee, setTdee] = useState(null);
  const [form, setForm] = useState({
    name: user?.name || '',
    calorieGoal: user?.calorieGoal || 2000,
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    activityLevel: user?.activityLevel || 'moderate',
    gender: user?.gender || 'male',
    goal: user?.goal || 'maintain',
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.age) payload.age = Number(payload.age);
      if (payload.weight) payload.weight = Number(payload.weight);
      if (payload.height) payload.height = Number(payload.height);
      payload.calorieGoal = Number(payload.calorieGoal);

      const res = await api.put('/user/update', payload);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      fetchTDEE();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchTDEE = async () => {
    try {
      const res = await api.get('/recommendations/tdee');
      setTdee(res.data);
    } catch (err) {
      console.log('TDEE not available:', err.response?.data?.message);
    }
  };

  useState(() => { fetchTDEE(); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Toaster position="top-right" />

      <div>
        <h1 className="page-title">Profile Settings</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your account and nutrition goals</p>
      </div>

      {/* Profile Card */}
      <div className="glass-card-solid p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/30">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white">{user?.name}</h2>
            <p className="text-surface-500 dark:text-surface-400 flex items-center gap-2">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    className="input-field pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} className="select-field">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Body Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-4">Body Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Age</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="number" name="age" value={form.age} onChange={handleChange}
                    placeholder="25" min="10" max="120" className="input-field pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Weight (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="number" name="weight" value={form.weight} onChange={handleChange}
                    placeholder="70" min="20" max="500" className="input-field pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="number" name="height" value={form.height} onChange={handleChange}
                    placeholder="175" min="50" max="300" className="input-field pl-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h3 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-4">Nutrition Goals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Daily Calorie Goal</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input type="number" name="calorieGoal" value={form.calorieGoal} onChange={handleChange}
                    min="500" max="10000" className="input-field pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Activity Level</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <select name="activityLevel" value={form.activityLevel} onChange={handleChange}
                    className="select-field pl-12">
                    <option value="sedentary">Sedentary (little/no exercise)</option>
                    <option value="light">Light (1-3 days/week)</option>
                    <option value="moderate">Moderate (3-5 days/week)</option>
                    <option value="active">Active (6-7 days/week)</option>
                    <option value="very_active">Very Active (2x/day)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Your Goal</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <select name="goal" value={form.goal} onChange={handleChange} className="select-field pl-12">
                    <option value="weight_loss">🔥 Lose Weight (−500 kcal/day)</option>
                    <option value="maintain">⚖️ Maintain Weight</option>
                    <option value="weight_gain">💪 Gain Weight (+500 kcal/day)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary flex items-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      </div>

      {/* BMR / TDEE Results Card */}
      {user?.bmr && (
        <div className="glass-card-solid p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Your Energy Profile</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">Auto-calculated from your body metrics (Mifflin–St Jeor)</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-surface-900 dark:text-white">{user.bmr}</p>
              <p className="text-xs text-surface-400 mt-1">BMR (kcal/day)</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{user.tdee}</p>
              <p className="text-xs text-surface-400 mt-1">TDEE (kcal/day)</p>
            </div>
            <div className="bg-gradient-to-br from-primary-500 to-emerald-400 rounded-xl p-4 text-center shadow-lg shadow-primary-500/20">
              <p className="text-2xl font-bold text-white">{user.dailyCalorieGoal}</p>
              <p className="text-xs text-white/80 mt-1">Daily Goal (kcal)</p>
            </div>
          </div>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            💡 Your calorie goal updates automatically whenever you save new body metrics or change your goal.
          </p>
        </div>
      )}

      {/* Legacy TDEE from recommendations */}
      {!user?.bmr && tdee && (
        <div className="glass-card-solid p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Energy Expenditure</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400">Your estimated daily calories burned</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-surface-900 dark:text-white">{tdee.bmr}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">BMR (Basal Metabolic Rate)</p>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{tdee.tdee}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400">TDEE (Total Daily Energy)</p>
            </div>
          </div>
          <p className="text-sm text-surface-600 dark:text-surface-400 bg-surface-50 dark:bg-surface-900/50 rounded-xl p-4">
            💡 {tdee.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}
