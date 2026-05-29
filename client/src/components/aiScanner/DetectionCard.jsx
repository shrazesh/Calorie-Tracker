import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Edit2, Check, X, AlertCircle } from 'lucide-react';
import { calculateNutritionByServing } from '../../utils/nutritionCalculator';

const DetectionCard = ({ detection, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!detection || !detection.matchedFoods || detection.matchedFoods.length === 0) return null;

  const { label, confidence, matchedFoods, quantity, servingUnit, activeFoodId } = detection;
  
  // Find the selected food based on the activeFoodId or default to the first
  const selectedFood = matchedFoods.find(f => f.id === activeFoodId || f._id === activeFoodId) || matchedFoods[0];

  // Default values if undefined
  const currentQuantity = quantity || 1;
  const currentServingUnit = servingUnit || (selectedFood.servings && selectedFood.servings.length > 0 ? selectedFood.servings[0].label : '100 g');

  // Helper to determine confidence label
  const getConfidenceLabel = (conf) => {
    if (conf >= 0.90) return { text: "Excellent Match", color: "bg-emerald-100 text-emerald-700" };
    if (conf >= 0.70) return { text: "Good Match", color: "bg-blue-100 text-blue-700" };
    return { text: "Possible Match", color: "bg-amber-100 text-amber-700" };
  };

  const confLabel = getConfidenceLabel(confidence);

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    const numVal = parseFloat(val);
    
    // We still want to let users type things like "1." without immediately breaking the input
    // So if it's not a valid number, we still pass it, but maybe as a string for temporary state.
    // However, since we removed localData, we should only update if valid, or handle strings carefully.
    // Let's pass the string/number to the parent. The parent can handle it.
    onUpdate({
      ...detection,
      quantity: isNaN(numVal) ? val : numVal,
      servingUnit: currentServingUnit,
      activeFoodId: selectedFood.id || selectedFood._id
    });
  };

  const handleQuantityAdjust = (delta) => {
    const currentNum = parseFloat(currentQuantity) || 1;
    const newQuantity = Math.max(0.1, currentNum + delta);
    onUpdate({
      ...detection,
      quantity: newQuantity,
      servingUnit: currentServingUnit,
      activeFoodId: selectedFood.id || selectedFood._id
    });
  };

  const handleServingChange = (e) => {
    const selectedLabel = e.target.value;
    onUpdate({
      ...detection,
      quantity: parseFloat(currentQuantity) || 1,
      servingUnit: selectedLabel,
      activeFoodId: selectedFood.id || selectedFood._id
    });
  };

  const handleAlternativeSelect = (e) => {
    const newFoodId = e.target.value;
    const newFood = matchedFoods.find(f => f.id === newFoodId || f._id === newFoodId) || matchedFoods[0];
    const newServing = newFood.servings && newFood.servings.length > 0 
        ? newFood.servings[0].label 
        : '100 g';

    onUpdate({
      ...detection,
      quantity: 1, // Reset quantity when changing food
      servingUnit: newServing,
      activeFoodId: newFoodId
    });
  };

  // Macro Calculation using the shared utility!
  // This guarantees that the Total Nutrition card and the Detection Card are ALWAYS synchronized
  const macros = calculateNutritionByServing(selectedFood, parseFloat(currentQuantity) || 1, currentServingUnit);

  const isLowConfidence = confidence < 0.65;
  const showAlternativeSelector = isEditing || isLowConfidence;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl shadow-sm border ${isLowConfidence ? 'border-amber-300' : 'border-slate-200'} overflow-hidden mb-4`}
    >
      {/* Header */}
      <div className={`px-4 py-3 border-b flex justify-between items-center ${isLowConfidence ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          {isLowConfidence ? (
            <AlertCircle className="w-4 h-4 text-amber-500" />
          ) : (
            <Target className="w-4 h-4 text-emerald-600" />
          )}
          <span className="font-semibold text-slate-800 capitalize">{label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confLabel.color}`}>
            {confLabel.text} ({Math.round(confidence * 100)}%)
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
      <div className={`p-4 flex flex-col md:flex-row gap-4 ${isLowConfidence && !isEditing ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Left: Info & Macros */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="text-lg font-bold text-slate-800">{selectedFood.name}</h4>
              <p className="text-sm text-emerald-600 font-bold">
                {macros.calories} kcal <span className="text-slate-400 font-normal">total</span>
              </p>
            </div>
            {!showAlternativeSelector && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Edit food or quantity"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Macros Row */}
          <div className="flex gap-4 text-sm mb-4">
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs">Protein</span>
              <span className="font-semibold text-slate-700">{macros.protein_g}g</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs">Carbs</span>
              <span className="font-semibold text-slate-700">{macros.carbs_g}g</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs">Fat</span>
              <span className="font-semibold text-slate-700">{macros.fat_g}g</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 text-xs">Fiber</span>
              <span className="font-semibold text-slate-700">{macros.fiber_g}g</span>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Controls */}
        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center">
          <div className="flex gap-2 items-end">
            <div className="flex-[1]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => handleQuantityAdjust(-1)}
                  className="px-2 py-1 text-slate-500 hover:bg-slate-100"
                >-</button>
                <input 
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={currentQuantity}
                  onChange={handleQuantityChange}
                  className="w-12 text-center py-1 text-sm font-semibold focus:outline-none"
                />
                <button 
                  onClick={() => handleQuantityAdjust(1)}
                  className="px-2 py-1 text-slate-500 hover:bg-slate-100"
                >+</button>
              </div>
            </div>

            <div className="flex-[2]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Serving</label>
              <select 
                value={currentServingUnit}
                onChange={handleServingChange}
                className="w-full appearance-none bg-white border border-slate-200 text-slate-800 py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              >
                {selectedFood.servings && selectedFood.servings.length > 0 ? (
                  selectedFood.servings.map((s, idx) => (
                    <option key={idx} value={s.label}>
                      {s.label} ({s.grams}g)
                    </option>
                  ))
                ) : (
                  <option value="100 g">100 g</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Did You Mean / Alternative Selection UI */}
      <AnimatePresence>
        {showAlternativeSelector && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`px-4 pb-4 border-t ${isLowConfidence ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}
          >
            <div className="pt-4">
              {isLowConfidence ? (
                <div className="mb-3">
                  <h5 className="text-amber-800 font-bold mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Did you mean?
                  </h5>
                  <p className="text-xs text-amber-700">Confidence is low. Please confirm the correct food from the top AI predictions below:</p>
                </div>
              ) : (
                <label className="block text-xs font-medium text-slate-500 mb-2">Select alternative food match:</label>
              )}
              
              <div className="flex flex-col gap-2 mb-4">
                {matchedFoods.map(alt => (
                  <label key={alt.id || alt._id} className="flex items-center gap-3 p-3 rounded-lg border bg-white cursor-pointer hover:border-emerald-500 transition-colors">
                    <input 
                      type="radio"
                      name={`food-alt-${label}`}
                      value={alt.id || alt._id}
                      checked={(selectedFood.id || selectedFood._id) === (alt.id || alt._id)}
                      onChange={handleAlternativeSelect}
                      className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <span className="block text-sm font-semibold text-slate-800">{alt.name}</span>
                      <span className="block text-xs text-slate-500">{alt.calories_per_100g} kcal per 100g</span>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    // Force minimum 0.65 confidence when manually confirmed so the UI hides the warning
                    onUpdate({
                      ...detection,
                      confidence: Math.max(detection.confidence, 0.65)
                    });
                    setIsEditing(false);
                  }}
                  className="px-6 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirm Selection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DetectionCard;
