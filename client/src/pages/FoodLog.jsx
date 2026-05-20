import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit3, Trash2, X, Check, Calendar, Filter, Camera, Zap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import FoodScanner from '../components/FoodScanner/FoodScanner';
import { useAuth } from '../context/AuthContext';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const formatFoodName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function FoodLog() {
  const { user } = useAuth();
  const calorieGoal = user?.dailyCalorieGoal || user?.calorieGoal || 2000;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('daily');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState(null);
  const [selectedServing, setSelectedServing] = useState(null); // { label, grams }
  const [form, setForm] = useState({
    foodName: '', calories: '', quantity: 1, category: 'Breakfast', date: new Date().toISOString().split('T')[0]
  });
  const [swaps, setSwaps] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food/all', { params: { filter } });
      setEntries(res.data.entries);
    } catch (err) {
      toast.error('Failed to load food entries');
    } finally {
      setLoading(false);
    }
  };

  const searchFood = async (query, catVal) => {
    const q = query !== undefined ? query : searchQuery;
    const c = catVal !== undefined ? catVal : selectedCategory;
    setSearchQuery(q);
    setSelectedCategory(c);
    setSearching(true);
    try {
      const res = await api.get('/foods', { params: { search: q, category: c } });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (showAddForm) {
      searchFood('', 'All');
    } else {
      setSearchResults([]);
      setSearchQuery('');
      setSelectedCategory('All');
    }
  }, [showAddForm]);

  const selectSearchResult = async (food) => {
    try {
      const res = await api.get(`/foods/${food._id}`);
      const foodData = res.data;

      setSelectedFoodDetails(foodData);
      
      // Default to first serving option
      if (foodData.servings && foodData.servings.length > 0) {
        setSelectedServing(foodData.servings[0]);
      } else {
        setSelectedServing({ label: "100 g", grams: 100 });
      }

      setForm(prev => ({
        ...prev,
        foodName: foodData.name,
        category: foodData.category || prev.category
      }));

      // Fetch healthier swaps live!
      const swapRes = await api.get(`/recommend/swap/${encodeURIComponent(foodData.name)}`);
      setSwaps(swapRes.data.swaps || []);
    } catch (err) {
      toast.error('Failed to load food details');
      console.error('Error loading food details:', err);
    }
    setSearchResults([]);
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const getLiveMacros = () => {
    if (!selectedFoodDetails || !selectedServing) return null;
    const qty = parseFloat(form.quantity) || 0;
    const gramsTotal = Math.round((selectedServing.grams * qty) * 10) / 10;
    const factor = gramsTotal / 100;

    const sourceNutrients = selectedFoodDetails.nutrientsPer100g || {
      calories: selectedFoodDetails.calories_per_100g || 0,
      protein: selectedFoodDetails.protein_g || 0,
      carbs: selectedFoodDetails.carbs_g || 0,
      fat: selectedFoodDetails.fats_g || 0,
      fiber: selectedFoodDetails.fiber_g || 0
    };

    return {
      calories: Math.round(sourceNutrients.calories * factor),
      protein: Math.round(sourceNutrients.protein * factor * 10) / 10,
      carbs: Math.round(sourceNutrients.carbs * factor * 10) / 10,
      fat: Math.round(sourceNutrients.fat * factor * 10) / 10,
      fiber: Math.round(sourceNutrients.fiber * factor * 10) / 10,
      gramsTotal
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodName) {
      toast.error('Food name is required');
      return;
    }

    const live = getLiveMacros();
    const payload = {
      category: form.category,
      date: form.date,
      quantity: Number(form.quantity || 1)
    };

    if (selectedFoodDetails) {
      payload.foodId = selectedFoodDetails._id;
      payload.foodName = selectedFoodDetails.name;
      payload.servingLabel = selectedServing?.label || '100 g';
    } else {
      payload.foodName = form.foodName;
      payload.calories = Number(form.calories || 0);
    }

    try {
      if (editingId) {
        await api.put(`/food/update/${editingId}`, payload);
        toast.success('Entry updated');
        setEditingId(null);
      } else {
        await api.post('/food/add', payload);
        toast.success('Food entry added');
      }
      resetForm();
      fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = async (entry) => {
    try {
      const foodId = entry.food || entry.foodId;
      if (foodId) {
        const detailRes = await api.get(`/foods/${foodId}`);
        const foodData = detailRes.data;
        setSelectedFoodDetails(foodData);
        if (foodData.servings) {
          const activeServing = foodData.servings.find(s => s.label === entry.servingLabel) || foodData.servings[0];
          setSelectedServing(activeServing);
        }
      } else {
        // Fallback for custom entries
        setSelectedFoodDetails(null);
        setSelectedServing(null);
      }
    } catch (e) {
      console.error('Non-critical: couldn\'t fetch edit details', e);
    }

    setForm({
      foodName: entry.foodName,
      calories: entry.calories,
      quantity: entry.quantity,
      category: entry.category,
      date: new Date(entry.date).toISOString().split('T')[0]
    });
    setEditingId(entry._id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.delete(`/food/delete/${id}`);
      toast.success('Entry deleted');
      fetchEntries();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setSelectedFoodDetails(null);
    setSelectedServing(null);
    setForm({ foodName: '', calories: '', quantity: 1, category: 'Breakfast', date: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
    setEditingId(null);
    setSearchResults([]);
    setSearchQuery('');
    setSelectedCategory('All');
    setSwaps([]);
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const remaining = calorieGoal - totalCalories;

  const groupedEntries = entries.reduce((acc, entry) => {
    const dateKey = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Food Log</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Track and manage your food entries</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`btn-secondary flex items-center gap-2 w-fit ${showScanner ? 'bg-primary-50 text-primary-600 border-primary-200' : ''}`}
          >
            <Camera className="w-5 h-5" />
            {showScanner ? 'Close Scanner' : 'Scan Food'}
          </button>
          <button
            onClick={() => { resetForm(); setShowAddForm(true); }}
            className="btn-primary flex items-center gap-2 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Food
          </button>
        </div>
      </div>

      {/* Scanner Section */}
      {showScanner && (
        <div className="animate-slide-down">
          <FoodScanner onLogged={() => { fetchEntries(); setShowScanner(false); }} />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-surface-400" />
        {['daily', 'weekly', 'monthly'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              filter === f
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 text-base text-surface-500 dark:text-surface-400 flex-wrap">
          {filter === 'daily' && (
            <>
              <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/40 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
                <span className="font-semibold text-surface-500 dark:text-surface-400 text-sm">Goal:</span>
                <span className="font-extrabold text-surface-900 dark:text-white text-lg">{calorieGoal.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/40 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
                <span className="font-semibold text-surface-500 dark:text-surface-400 text-sm">Consumed:</span>
                <span className="font-extrabold text-surface-900 dark:text-white text-lg">{totalCalories.toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${
                remaining < 0 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30' 
                  : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30'
              }`}>
                <span className="font-extrabold text-lg">{remaining < 0 ? `+${Math.abs(remaining).toLocaleString()}` : remaining.toLocaleString()}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{remaining < 0 ? 'Over' : 'Remaining'}</span>
              </div>
            </>
          )}
          {filter !== 'daily' && (
            <div className="flex items-center gap-2 bg-surface-50 dark:bg-surface-800/40 px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
              <span className="font-semibold text-surface-500 dark:text-surface-400 text-sm">Total Consumed:</span>
              <span className="font-extrabold text-surface-900 dark:text-white text-lg">{totalCalories.toLocaleString()}</span>
            </div>
          )}
          <div className="text-sm text-surface-500 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 px-4 py-2 rounded-xl font-bold shadow-sm">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="glass-card-solid p-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
              {editingId ? 'Edit Food Entry' : 'Add Food Entry'}
            </h3>
            <button onClick={resetForm} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800">
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>

          {/* Food Search */}
          <div className="mb-6 relative">
            <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Search USDA Database</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => searchFood(e.target.value, undefined)}
                onFocus={() => {
                  if (searchResults.length === 0) {
                    searchFood(searchQuery, undefined);
                  }
                }}
                placeholder="Search real foods (e.g. Oatmeal, Biryani, Apple...)"
                className="input-field pl-12 shadow-sm focus:shadow-md transition-shadow"
              />
            </div>

            {/* Horizontal Categories Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 mt-3 no-scrollbar scroll-smooth border-b border-surface-100 dark:border-surface-700/60">
              {['All', 'Nepali Foods', 'Meals', 'Ingredients', 'Fruits & Veg', 'Snacks', 'Drinks', 'Protein', 'Grains', 'Dairy'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => searchFood(undefined, cat)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 scale-[1.03]'
                      : 'bg-surface-50 dark:bg-surface-800/80 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 hover:scale-[1.02]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Searching State */}
            {searching && (
              <div className="mt-4 flex justify-center items-center py-8 animate-fade-in">
                <div className="flex items-center gap-3 text-primary-500 font-semibold text-sm bg-primary-50/50 dark:bg-primary-950/10 px-5 py-3 rounded-2xl border border-primary-100/30 dark:border-primary-900/30">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span>Searching USDA library...</span>
                </div>
              </div>
            )}

            {/* Search Results Grid */}
            {!searching && searchResults.length > 0 && (
              <div className="mt-4 bg-surface-50/50 dark:bg-surface-900/10 rounded-2xl border border-surface-200 dark:border-surface-700/60 p-4 max-h-72 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 shadow-inner animate-slide-down">
                {searchResults.map((food) => (
                  <button
                    key={food._id}
                    type="button"
                    onClick={() => selectSearchResult(food)}
                    className="flex items-center justify-between p-3 bg-white dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-950/20 border border-surface-150 dark:border-surface-700/60 rounded-xl hover:border-primary-300 dark:hover:border-primary-850 hover:shadow-sm transition-all duration-300 text-left group"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-sm truncate">
                        {formatFoodName(food.name)}
                      </p>
                    </div>
                    <span className="text-xs text-primary-500 font-bold group-hover:translate-x-0.5 transition-transform flex-shrink-0 flex items-center gap-0.5">
                      Select
                      <span className="text-sm font-normal">→</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!searching && searchResults.length === 0 && searchQuery && (
              <div className="mt-4 p-8 bg-surface-50/50 dark:bg-surface-900/10 rounded-2xl border border-dashed border-surface-250 dark:border-surface-700 text-center animate-fade-in">
                <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">
                  No foods found matching "{searchQuery}" under "{selectedCategory}" category.
                </p>
              </div>
            )}
          </div>

          {/* Healthier Swaps Inline Options */}
          {selectedFoodDetails && swaps.length > 0 && (
            <div className="mb-6 p-5 bg-surface-50 dark:bg-surface-800/40 rounded-2xl border border-surface-200 dark:border-surface-700 animate-slide-down">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h5 className="text-xs font-bold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  💡 Healthier USDA Swaps Available:
                </h5>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {swaps.map((swapItem) => (
                  <button
                    key={swapItem._id}
                    type="button"
                    onClick={() => selectSearchResult(swapItem)}
                    className="flex flex-col justify-between p-3 bg-white dark:bg-surface-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-surface-200 dark:border-surface-700 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-850 hover:shadow-sm transition-all duration-300 text-left group animate-fade-in"
                  >
                    <span className="font-bold text-xs text-surface-900 dark:text-white capitalize group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1 mb-1">
                      {formatFoodName(swapItem.name)}
                    </span>
                    <div className="flex justify-between items-center text-[10px] text-surface-500 dark:text-surface-400">
                      <span>{swapItem.calories_per_100g} cal</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">+{swapItem.protein_g}g Pro</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Cronometer Serving & Quantity Selectors */}
            {selectedFoodDetails ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-primary-50/20 dark:bg-primary-950/5 p-5 rounded-2xl border border-primary-100/40 dark:border-primary-900/10 animate-fade-in space-y-4">
                
                {/* Header showing Selected Food Name */}
                <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-750">
                  <div>
                    <span className="text-[10px] font-bold text-primary-500 uppercase tracking-wider block">Selected USDA Food</span>
                    <span className="text-base font-extrabold text-surface-900 dark:text-white capitalize">
                      {formatFoodName(selectedFoodDetails.name)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Serving Size</label>
                    <select
                      value={selectedServing?.label || '100 g'}
                      onChange={(e) => {
                        const s = selectedFoodDetails.servings?.find(sv => sv.label === e.target.value);
                        if (s) setSelectedServing(s);
                      }}
                      className="select-field"
                    >
                      {selectedFoodDetails.servings?.map(s => (
                        <option key={s.label} value={s.label}>
                          {s.label} ({s.grams}g)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
                      className="input-field"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Live calculated macros block */}
                {(() => {
                  const live = getLiveMacros();
                  if (!live) return null;
                  return (
                    <div className="col-span-1 sm:col-span-2 mt-2 p-4 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700/60 shadow-sm animate-slide-down">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Live Calculated Metrics</span>
                        <span className="text-xs font-semibold text-primary-500">{live.gramsTotal}g total weight</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                        <div className="p-2.5 bg-primary-50/50 dark:bg-primary-950/10 rounded-lg border border-primary-100/10">
                          <span className="text-[10px] font-bold text-primary-600 block mb-0.5">Calories</span>
                          <span className="text-lg font-extrabold text-primary-700 dark:text-primary-300">{live.calories}</span>
                        </div>
                        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg border border-emerald-100/10">
                          <span className="text-[10px] font-bold text-emerald-600 block mb-0.5">Protein</span>
                          <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{live.protein}g</span>
                        </div>
                        <div className="p-2.5 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg border border-amber-100/10">
                          <span className="text-[10px] font-bold text-amber-600 block mb-0.5">Carbs</span>
                          <span className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{live.carbs}g</span>
                        </div>
                        <div className="p-2.5 bg-rose-50/50 dark:bg-rose-950/10 rounded-lg border border-rose-100/10">
                          <span className="text-[10px] font-bold text-rose-600 block mb-0.5">Fat</span>
                          <span className="text-lg font-extrabold text-rose-700 dark:text-rose-300">{live.fat}g</span>
                        </div>
                        <div className="p-2.5 bg-violet-50/50 dark:bg-violet-950/10 rounded-lg border border-violet-100/10">
                          <span className="text-[10px] font-bold text-violet-600 block mb-0.5">Fiber</span>
                          <span className="text-lg font-extrabold text-violet-700 dark:text-violet-300">{live.fiber}g</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Food Name *</label>
                  <input type="text" value={form.foodName}
                    onChange={(e) => setForm(p => ({ ...p, foodName: e.target.value }))}
                    placeholder="e.g., Grilled Chicken" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Calories *</label>
                  <input
                    type="number"
                    value={form.calories}
                    onChange={(e) => setForm(p => ({ ...p, calories: e.target.value }))}
                    placeholder="e.g., 350"
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm(p => ({ ...p, quantity: e.target.value }))}
                    className="input-field"
                    min="0.1"
                    step="0.1"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Category</label>
              <select value={form.category}
                onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                className="select-field">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Date</label>
              <input type="date" value={form.date}
                onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                className="input-field" />
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Check className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Entries List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card-solid p-12 text-center">
          <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-surface-300 dark:text-surface-600" />
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">No entries found</h3>
          <p className="text-surface-500 dark:text-surface-400 mb-6">Start tracking your meals to see them here</p>
          <button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn-primary mx-auto">
            <Plus className="w-5 h-5 inline mr-2" /> Add your first meal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([dateKey, dayEntries]) => (
            <div key={dateKey} className="glass-card-solid overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-surface-50 dark:bg-surface-900/50 border-b border-surface-100 dark:border-surface-700">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-surface-400" />
                  <span className="font-semibold text-surface-900 dark:text-white">{dateKey}</span>
                </div>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {dayEntries.reduce((s, e) => s + e.calories, 0).toLocaleString()} cal
                </span>
              </div>
              <div className="divide-y divide-surface-100 dark:divide-surface-700">
                {dayEntries.map(entry => (
                  <div key={entry._id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-900/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`badge badge-${entry.category.toLowerCase()}`}>{entry.category}</span>
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">{entry.foodName}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          {entry.quantity} × {entry.servingLabel || '100 g'} ({entry.gramsTotal || 100}g) • {new Date(entry.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-surface-900 dark:text-white">{entry.calories} cal</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(entry)}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-blue-500 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(entry._id)}
                          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
