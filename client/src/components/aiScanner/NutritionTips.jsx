import React from 'react';
import { Lightbulb, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const NutritionTips = ({ tips }) => {
  if (!tips || tips.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-emerald-200 p-2 rounded-full">
          <Lightbulb className="w-5 h-5 text-emerald-700" />
        </div>
        <h3 className="font-bold text-emerald-900">AI Nutrition Insights</h3>
      </div>
      
      <ul className="space-y-3">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-2xl shadow-sm border border-emerald-50/50">
            {tip.type === 'alert' ? (
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            ) : tip.type === 'swap' ? (
              <ArrowRight className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            ) : (
              <Lightbulb className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-slate-700 leading-relaxed">
              {tip.message}
            </p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default NutritionTips;
