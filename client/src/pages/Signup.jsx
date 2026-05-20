import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User, Target, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: form.name,
        email: form.email,
        password: form.password
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
              <Flame className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Calorie Tracker</h1>
          </div>

          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Start your<br />
            health journey<br />
            <span className="text-white/80">today</span>
          </h2>
          <p className="text-lg text-white/70 max-w-md">
            Join thousands of users who've transformed their diet with smart tracking and AI recommendations.
          </p>
        </div>

        <div className="relative space-y-4">
          {['Set personalized calorie goals', 'Track meals with ease', 'Get AI-powered food suggestions'].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface-50 dark:bg-surface-950">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">Calorie Tracker</h1>
          </div>

          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Create account</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-8">Get started with your nutrition journey</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input id="signup-name" type="text" name="name" value={form.name} onChange={handleChange}
                  className="input-field pl-12" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input id="signup-email" type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="name@example.com" className="input-field pl-12" autoComplete="email" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input id="signup-password" type={showPassword ? 'text' : 'password'} name="password"
                    value={form.password} onChange={handleChange} placeholder="Min 6 chars" className="input-field pl-12 pr-12" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                  <input id="signup-confirm" type={showPassword ? 'text' : 'password'} name="confirmPassword"
                    value={form.confirmPassword} onChange={handleChange} placeholder="Confirm" className="input-field pl-12 pr-12" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>


            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              {showPassword ? 'Hide passwords' : 'Show passwords'}
            </button>

            <button id="signup-submit" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-surface-500 dark:text-surface-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
