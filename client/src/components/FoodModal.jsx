import { useState, useEffect } from 'react';
import api from '../utils/api';
import { X, Flame, ShieldAlert } from 'lucide-react';

export default function FoodModal({ foodId, onClose }) {
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!foodId) return;

    const fetchFoodDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/foods/${foodId}`);
        setFood(res.data);
      } catch (err) {
        console.error('Error fetching food details:', err);
        setError('Failed to load nutritional values.');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodDetails();
  }, [foodId]);

  if (!foodId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden transform scale-100 transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-800">
          <h3 className="text-xl font-bold text-surface-900 dark:text-white truncate pr-4">
            {loading ? 'Loading...' : food?.name}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-surface-500">Fetching USDA nutrition data...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-red-500">
              <ShieldAlert className="w-12 h-12 mb-2" />
              <p className="font-semibold">{error}</p>
              <button onClick={onClose} className="btn-secondary mt-4">Close</button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Serving Note */}
              <div className="bg-surface-50 dark:bg-surface-800/40 p-4 rounded-2xl border border-surface-100 dark:border-surface-800 text-center">
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Nutritional facts based on a <span className="font-semibold text-surface-900 dark:text-white">100g</span> portion
                </p>
              </div>

              {/* Main Calories Display */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-br from-primary-50 to-primary-100/30 dark:from-primary-950/20 dark:to-primary-900/10 rounded-2xl border border-primary-100/50 dark:border-primary-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Energy</h4>
                    <p className="text-xs text-surface-400">Calories (kcal)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                    {food.calories_per_100g}
                  </span>
                  <span className="text-sm font-bold text-surface-500 dark:text-surface-400 ml-1">kcal</span>
                </div>
              </div>

              {/* Macronutrient Grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Protein */}
                <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20 text-center">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">Protein</span>
                  <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {food.protein_g ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 block mt-0.5">g</span>
                </div>

                {/* Carbs */}
                <div className="p-4 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl border border-amber-100/30 dark:border-amber-900/20 text-center">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">Carbs</span>
                  <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
                    {food.carbs_g ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 block mt-0.5">g</span>
                </div>

                {/* Fat */}
                <div className="p-4 bg-rose-50/40 dark:bg-rose-950/10 rounded-2xl border border-rose-100/30 dark:border-rose-900/20 text-center">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-1">Fat</span>
                  <span className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">
                    {food.fats_g ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 block mt-0.5">g</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
