import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Scale, Ruler, Activity, Target, Flame, Zap, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',  label: 'Sedentary',   desc: 'Little or no exercise' },
  { value: 'light',      label: 'Light',        desc: '1–3 days/week' },
  { value: 'moderate',   label: 'Moderate',     desc: '3–5 days/week' },
  { value: 'active',     label: 'Active',       desc: '6–7 days/week' },
  { value: 'very_active',label: 'Very Active',  desc: 'Twice a day / physical job' },
];

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: '🔥 Lose Weight',    desc: 'Calorie deficit (−500 kcal)' },
  { value: 'maintain',    label: '⚖️ Maintain Weight', desc: 'Match your TDEE exactly' },
  { value: 'weight_gain', label: '💪 Gain Weight',    desc: 'Calorie surplus (+500 kcal)' },
];

export default function SetupProfileModal({ onComplete }) {
  const { updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain',
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const selectOption = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isStep1Valid = form.gender && form.age && form.weight && form.height;
  const isStep2Valid = form.activityLevel && form.goal;

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/user/calculate-goal', {
        ...form,
        age: Number(form.age),
        weight: Number(form.weight),
        height: Number(form.height),
      });
      setResult(res.data);
      updateUser(res.data.user);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-surface-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-surface-100 dark:bg-surface-800">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* ── STEP 1: Body Metrics ─────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                  👋 Welcome! Let's set up your profile
                </h2>
                <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
                  We'll calculate your personalised daily calorie goal using your body metrics.
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => selectOption('gender', g)}
                      className={`py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                        form.gender === g
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-300'
                      }`}
                    >
                      {g === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age / Weight / Height */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'age',    label: 'Age',         unit: 'yrs', icon: User,  min: 10, max: 120 },
                  { name: 'weight', label: 'Weight',      unit: 'kg',  icon: Scale, min: 20, max: 500 },
                  { name: 'height', label: 'Height',      unit: 'cm',  icon: Ruler, min: 50, max: 300 },
                ].map(({ name, label, unit, icon: Icon, min, max }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="number"
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        min={min}
                        max={max}
                        placeholder="—"
                        className="input-field pl-9 pr-2 text-center"
                      />
                    </div>
                    <p className="text-xs text-center text-surface-400 mt-1">{unit}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Activity & Goal ───────────────────────── */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Activity & Goal</h2>
                <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
                  Tell us how active you are and what you want to achieve.
                </p>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Activity Level
                </label>
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectOption('activityLevel', value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        form.activityLevel === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                          : 'border-surface-200 dark:border-surface-700 hover:border-primary-300'
                      }`}
                    >
                      <span className="font-medium text-surface-800 dark:text-white text-sm">{label}</span>
                      <span className="text-xs text-surface-400 ml-2">— {desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Your Goal
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {GOAL_OPTIONS.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectOption('goal', value)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        form.goal === value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-surface-200 dark:border-surface-700 hover:border-emerald-300'
                      }`}
                    >
                      <span className="font-medium text-surface-800 dark:text-white text-sm">{label}</span>
                      <span className="text-xs text-surface-400 ml-2">— {desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isStep2Valid || loading}
                  onClick={handleCalculate}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Zap className="w-4 h-4" /> Calculate</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Results ──────────────────────────────── */}
          {step === 3 && result && (
            <div className="space-y-6 animate-fade-in text-center">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Your Calorie Goal is Ready!</h2>
                <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
                  Calculated using the Mifflin–St Jeor Equation
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl p-4">
                  <p className="text-2xl font-bold text-surface-900 dark:text-white">{result.bmr}</p>
                  <p className="text-xs text-surface-400 mt-1">BMR<br/><span className="text-surface-300">kcal/day</span></p>
                </div>
                <div className="bg-surface-50 dark:bg-surface-800 rounded-2xl p-4">
                  <p className="text-2xl font-bold text-blue-500">{result.tdee}</p>
                  <p className="text-xs text-surface-400 mt-1">TDEE<br/><span className="text-surface-300">kcal/day</span></p>
                </div>
                <div className="bg-gradient-to-br from-primary-500 to-emerald-400 rounded-2xl p-4 shadow-lg shadow-primary-500/30">
                  <p className="text-2xl font-bold text-white">{result.dailyCalorieGoal}</p>
                  <p className="text-xs text-white/80 mt-1">Daily Goal<br/><span className="text-white/60">kcal/day</span></p>
                </div>
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-left">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  💡 Your daily calorie goal of <strong>{result.dailyCalorieGoal} kcal</strong> has been saved to your profile and is now reflected on your dashboard.
                </p>
              </div>

              <button
                type="button"
                onClick={onComplete}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
