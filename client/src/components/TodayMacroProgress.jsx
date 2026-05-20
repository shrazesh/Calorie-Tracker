import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Shield, Zap, Flame, Droplet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TodayMacroProgress({ data: propData, onRefresh }) {
  const [macroData, setMacroData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMacros = async () => {
    try {
      setLoading(true);
      const res = await api.get('/nutrition/today-macros');
      setMacroData(res.data);
    } catch (err) {
      console.error('Error fetching today macros:', err);
      toast.error('Failed to load today\'s macro progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propData) {
      fetchMacros();
    } else {
      setMacroData(propData);
    }
  }, [propData]);

  if (loading && !macroData) {
    return (
      <div className="glass-card-solid p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-surface-200 dark:bg-surface-700 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-200 dark:bg-surface-700 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!macroData) return null;

  const macros = [
    {
      name: 'Protein',
      key: 'protein',
      unit: 'g',
      colorClass: 'from-violet-500 to-indigo-600 shadow-indigo-500/20',
      bgClass: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30',
      textClass: 'text-indigo-600 dark:text-indigo-400',
      icon: Shield
    },
    {
      name: 'Carbs',
      key: 'carbs',
      unit: 'g',
      colorClass: 'from-amber-400 to-orange-500 shadow-amber-500/20',
      bgClass: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
      textClass: 'text-amber-600 dark:text-amber-400',
      icon: Zap
    },
    {
      name: 'Fat',
      key: 'fat',
      unit: 'g',
      colorClass: 'from-rose-400 to-pink-600 shadow-rose-500/20',
      bgClass: 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30',
      textClass: 'text-rose-600 dark:text-rose-400',
      icon: Droplet
    },
    {
      name: 'Calories',
      key: 'calories',
      unit: 'kcal',
      colorClass: 'from-orange-400 to-red-500 shadow-orange-500/20',
      bgClass: 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30',
      textClass: 'text-orange-600 dark:text-orange-400',
      icon: Flame
    }
  ];

  return (
    <div className="glass-card-solid p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
            📊 Today's Macro Progress
          </h3>
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            Live tracking of your macronutrient goals vs today's logged meals
          </p>
        </div>
        {!propData && (
          <button 
            onClick={fetchMacros}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition"
          >
            🔄 Refresh
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {macros.map((macro) => {
          const item = macroData[macro.key];
          if (!item) return null;

          const percentage = Math.min(item.percentage, 100);
          const isOver = item.consumed > item.goal;
          const Icon = macro.icon;

          return (
            <div 
              key={macro.key} 
              className={`p-4 rounded-2xl border ${macro.bgClass} flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-lg bg-white dark:bg-surface-900/40 border border-current/10 ${macro.textClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-surface-900 dark:text-white capitalize">
                      {macro.name}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOver 
                      ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                      : 'bg-white/80 dark:bg-surface-900/40 text-surface-600 dark:text-surface-400'
                  }`}>
                    {item.percentage}%
                  </span>
                </div>

                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xl font-black text-surface-900 dark:text-white">
                    {item.consumed.toLocaleString()}<span className="text-xs font-normal text-surface-500 dark:text-surface-400 ml-0.5">{macro.unit}</span>
                  </span>
                  <span className="text-xs font-semibold text-surface-400 dark:text-surface-500">
                    Goal: {item.goal.toLocaleString()}{macro.unit}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {/* Custom Styled Progress Bar */}
                <div className="h-2.5 bg-white/60 dark:bg-surface-900/50 rounded-full overflow-hidden border border-current/5">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r shadow-lg ${macro.colorClass} transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] font-bold text-surface-500 dark:text-surface-400">
                  <span>
                    {isOver ? 'Exceeded by' : 'Remaining'}
                  </span>
                  <span className={isOver ? 'text-red-500' : macro.textClass}>
                    {Math.abs(item.remaining).toLocaleString()}{macro.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
