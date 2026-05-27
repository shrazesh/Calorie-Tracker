import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Target, Edit2, Check, X, AlertCircle } from 'lucide-react';

const DetectionCard = ({ detection, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(null);

  // Initialize local data when detection changes or on mount
  useEffect(() => {
    if (detection && detection.matchedFood) {
      setLocalData({
        quantity: detection.quantity || 1,
        serving_unit: detection.matchedFood.serving_unit || 'g',
        matchedFoodId: detection.matchedFood._id
      });
    }
  }, [detection]);

  if (!detection || !detection.matchedFood) return null;

  const { label, confidence, matchedFood, alternatives } = detection;
  
  const handleQuantityChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      setLocalData({ ...localData, quantity: val });
    } else {
      setLocalData({ ...localData, quantity: e.target.value });
    }
  };

  const handleUnitChange = (e) => {
    setLocalData({ ...localData, serving_unit: e.target.value });
  };
  
  const handleAlternativeSelect = (e) => {
    const newFoodId = e.target.value;
    const newMatchedFood = alternatives.find(a => a._id === newFoodId) || matchedFood;
    
    setLocalData({
      quantity: 1, // Reset quantity when changing food
      serving_unit: newMatchedFood.serving_unit || 'g',
      matchedFoodId: newFoodId
    });
    
    // Auto-save when alternative is selected
    onUpdate({
      ...detection,
      matchedFood: newMatchedFood,
      quantity: 1,
      servingUnit: newMatchedFood.serving_unit || 'g'
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    onUpdate({
      ...detection,
      quantity: parseFloat(localData.quantity) || 1,
      servingUnit: localData.serving_unit
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalData({
      quantity: detection.quantity || 1,
      serving_unit: detection.matchedFood.serving_unit || 'g',
      matchedFoodId: detection.matchedFood._id
    });
  };

  // Safe macro fallback
  const getMacro = (macro) => (matchedFood[macro] || 0).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-800 capitalize">{label}</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            {Math.round(confidence * 100)}% match
          </span>
        </div>
        <button 
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Remove item"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        {!isEditing ? (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-800">{matchedFood.name}</h4>
              <p className="text-sm text-slate-500 mb-3">
                {detection.quantity || 1} {matchedFood.serving_unit || 'g'}
              </p>
              
              {/* Macros Row */}
              <div className="flex gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Cals</span>
                  <span className="font-semibold text-slate-700">{getMacro('calories')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Pro</span>
                  <span className="font-semibold text-emerald-600">{getMacro('protein_g')}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Carb</span>
                  <span className="font-semibold text-blue-600">{getMacro('carbs_g')}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-xs">Fat</span>
                  <span className="font-semibold text-amber-600">{getMacro('fat_g')}g</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Match Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Matched Food Database Item</label>
                <div className="relative">
                  <select 
                    value={localData.matchedFoodId}
                    onChange={handleAlternativeSelect}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 py-2 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium"
                  >
                    <option value={matchedFood._id}>{matchedFood.name}</option>
                    {alternatives && alternatives.map(alt => (
                      <option key={alt._id} value={alt._id}>
                        Alternative: {alt.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Serving Controls */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                  <input 
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={localData.quantity}
                    onChange={handleQuantityChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="flex-[2]">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Serving Unit</label>
                  <div className="relative">
                    <select 
                      value={localData.serving_unit}
                      onChange={handleUnitChange}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 py-2 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="g">grams (g)</option>
                      <option value="oz">ounces (oz)</option>
                      <option value="serving">Standard Serving</option>
                      <option value="piece">Piece</option>
                      <option value="cup">Cup</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-3 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      
      {/* Low Confidence Warning */}
      {confidence < 0.6 && !isEditing && (
        <div className="bg-amber-50 px-4 py-2 flex items-start gap-2 border-t border-amber-100">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Low confidence detection. Please verify this matches what's in your photo or select an alternative.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default DetectionCard;
