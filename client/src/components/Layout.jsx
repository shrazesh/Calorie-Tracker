import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, UtensilsCrossed, BarChart3, User, LogOut,
  Sun, Moon, Menu, X, Flame, ChevronRight, Search
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/food-log', label: 'Food Log', icon: UtensilsCrossed },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 p-6 fixed h-full z-30">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">Calorie Tracker</h1>
            <p className="text-xs text-surface-500 dark:text-surface-400">Smart Calorie Tracker</p>
          </div>
        </Link>

        {/* Nav Links */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto space-y-3">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-300"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
            <Menu className="w-6 h-6 text-surface-700 dark:text-surface-300" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-surface-900 dark:text-white">Calorie Tracker</span>
          </Link>
          <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
            {darkMode ? <Sun className="w-5 h-5 text-surface-700 dark:text-surface-300" /> : <Moon className="w-5 h-5 text-surface-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-900 p-6 animate-slide-up shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-surface-900 dark:text-white">Calorie Tracker</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto pt-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
