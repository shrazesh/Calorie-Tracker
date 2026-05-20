/**
 * Purpose: Presentational component for nutrition data preview.
 * Props: food, quantity, onQuantityChange.
 * Outputs: Rendered nutrition stats with macro bars.
 */

import React from 'react';

export default function NutritionPreview({ food, quantity, onQuantityChange }) {
  if (!food) return null;

  // Calculate values based on quantity
  const factor = quantity / 100;
  const calories = Math.round(food.calories_per_100g * factor);
  const protein = (food.protein_g * factor).toFixed(1);
  const carbs = (food.carbs_g * factor).toFixed(1);
  const fats = (food.fats_g * factor).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-surface-900 dark:text-white flex items-center gap-2">
          {food.name}
          <span className="text-xs font-medium px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
            {food.confidence_percent} match
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg text-center">
          <p className="text-2xl font-bold text-primary-600">{calories}</p>
          <p className="text-xs text-surface-500 uppercase tracking-wider">Calories</p>
        </div>
        <div className="flex flex-col justify-center space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500">Quantity</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => onQuantityChange(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded text-right dark:bg-surface-900"
              />
              <span className="text-surface-400">g</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Macro Bars */}
        <MacroBar label="Protein" value={protein} total={20} color="bg-blue-500" unit="g" />
        <MacroBar label="Carbs" value={carbs} total={50} color="bg-amber-500" unit="g" />
        <MacroBar label="Fats" value={fats} total={15} color="bg-purple-500" unit="g" />
      </div>
    </div>
  );
}

function MacroBar({ label, value, total, color, unit }) {
  const percentage = Math.min((value / total) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-surface-600 dark:text-surface-400">{label}</span>
        <span className="text-surface-900 dark:text-white">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-500`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
