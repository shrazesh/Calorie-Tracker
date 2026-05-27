import React from 'react';
import { motion } from 'framer-motion';

const MacroSummary = ({ totals }) => {
  if (!totals) return null;
  
  const { calories, protein_g, carbs_g, fat_g, fiber_g } = totals;

  const MacroCircle = ({ label, value, color, unit = "g" }) => (
    <div className="flex flex-col items-center">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 ${color} bg-white shadow-sm mb-1`}>
        <span className="font-bold text-slate-800 text-sm">
          {Math.round(value)}{unit}
        </span>
      </div>
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-md border border-slate-200 p-6 w-full"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Total Nutrition</h3>
          <p className="text-sm text-slate-500">Combined from all detected items</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-emerald-600 leading-none">
            {Math.round(calories)}
          </span>
          <span className="text-sm font-bold text-slate-400 ml-1 uppercase">kcal</span>
        </div>
      </div>

      <div className="flex justify-between items-center px-2">
        <MacroCircle label="Protein" value={protein_g} color="border-emerald-500" />
        <MacroCircle label="Carbs" value={carbs_g} color="border-blue-500" />
        <MacroCircle label="Fat" value={fat_g} color="border-amber-500" />
        <MacroCircle label="Fiber" value={fiber_g || 0} color="border-purple-500" />
      </div>
      
      {/* Progress Bar representation */}
      <div className="mt-6 flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(protein_g * 4 / calories) * 100 || 0}%` }}
          className="bg-emerald-500 h-full"
          title="Protein"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(carbs_g * 4 / calories) * 100 || 0}%` }}
          className="bg-blue-500 h-full"
          title="Carbs"
        />
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(fat_g * 9 / calories) * 100 || 0}%` }}
          className="bg-amber-500 h-full"
          title="Fat"
        />
      </div>
    </motion.div>
  );
};

export default MacroSummary;
