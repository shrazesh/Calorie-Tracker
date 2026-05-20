/**
 * Purpose: Main Food Scanner component for image recognition and meal logging.
 * Inputs: Camera capture or image upload.
 * Outputs: Recognition results and meal logging.
 */

import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Loader2, Check, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { useImageCapture } from './useImageCapture';
import NutritionPreview from './NutritionPreview';
import { recognizeFood, confirmFoodLog } from '../../services/foodRecognitionService';
import toast from 'react-hot-toast';

export default function FoodScanner({ onLogged }) {
  const { imageFile, previewUrl, error, handleFileSelect, resetCapture, setError } = useImageCapture();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState('Lunch');
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your meal...');

  // Cycle through loading messages
  useEffect(() => {
    if (!isAnalyzing) return;
    const messages = [
      "Analyzing your meal...",
      "Identifying food item...",
      "Fetching nutritional data...",
      "Calculating macros..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % messages.length;
      setLoadingMessage(messages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setResult(null);
    
    try {
      const data = await recognizeFood(imageFile);
      setResult(data);
      if (data.low_confidence) {
        toast.error('Multiple foods detected or low confidence.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to analyze food. Make sure the ML server is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmLog = async () => {
    if (!result?.matched_food) return;

    try {
      const logData = {
        food_item_id: result.matched_food.food_id,
        meal_type: mealType,
        quantity_g: quantity,
        confidence: result.predictions[0].confidence
      };

      await confirmFoodLog(logData);
      toast.success(`${result.matched_food.name} (${quantity}g) logged to ${mealType}!`);
      
      if (onLogged) onLogged();
      resetAll();
    } catch (err) {
      toast.error('Failed to log meal.');
    }
  };

  const resetAll = () => {
    resetCapture();
    setResult(null);
    setQuantity(100);
  };

  return (
    <div className="glass-card-solid p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">AI Food Scanner</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">Scan your plate to log nutrition instantly</p>
        </div>
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main UI Area */}
      {!previewUrl && !isAnalyzing && !result && (
        <div className="grid grid-cols-2 gap-4 py-8">
          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all group">
            <div className="w-12 h-12 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center group-hover:bg-primary-100">
              <Camera className="w-6 h-6 text-surface-600 dark:text-surface-400 group-hover:text-primary-600" />
            </div>
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Take Photo</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
          </label>

          <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-2xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all group">
            <div className="w-12 h-12 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center group-hover:bg-primary-100">
              <Upload className="w-6 h-6 text-surface-600 dark:text-surface-400 group-hover:text-primary-600" />
            </div>
            <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">Upload Image</span>
            <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileSelect} />
          </label>
        </div>
      )}

      {/* Image Preview & Analysis Action */}
      {previewUrl && !isAnalyzing && !result && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
            <button 
              onClick={resetAll}
              className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleAnalyze}
            className="btn-primary w-full py-4 flex items-center justify-center gap-3 shadow-xl shadow-primary-500/30"
          >
            Identify Food <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-500/20 rounded-full" />
            <Loader2 className="w-20 h-20 text-primary-500 animate-spin absolute top-0" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold text-surface-900 dark:text-white">{loadingMessage}</p>
            <p className="text-sm text-surface-500">Our CNN is crunching the pixels...</p>
          </div>
        </div>
      )}

      {/* Result Card */}
      {result && !isAnalyzing && (
        <div className="space-y-6 animate-slide-up">
          {result.low_confidence ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Low Confidence Match</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">We're not 100% sure. Did you mean one of these?</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {result.predictions.map((p, i) => (
                    <button 
                      key={i} 
                      className="px-3 py-1 bg-white dark:bg-surface-800 border border-amber-200 dark:border-amber-700 rounded-full text-xs font-medium hover:bg-amber-100 transition-colors"
                    >
                      {p.display_name} ({p.confidence_percent})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : result.matched_food ? (
            <div className="bg-surface-50 dark:bg-surface-900 rounded-2xl p-6 border border-surface-100 dark:border-surface-800">
              <NutritionPreview 
                food={result.matched_food} 
                quantity={quantity} 
                onQuantityChange={setQuantity} 
              />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-surface-500 uppercase ml-1">Meal Time</label>
                  <select 
                    value={mealType} 
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm font-medium"
                  >
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                    <option>Snacks</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleConfirmLog}
                    className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Log Meal
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-4">
              <Info className="w-12 h-12 text-primary-500 mx-auto" />
              <p className="text-surface-700 dark:text-surface-300">
                We identified this as <span className="font-bold">{result.predictions[0].display_name}</span>, but we don't have its nutritional data in our database yet.
              </p>
              <button onClick={resetAll} className="text-primary-500 font-bold hover:underline">Try another food</button>
            </div>
          )}

          <button 
            onClick={resetAll}
            className="w-full py-2 text-sm text-surface-500 dark:text-surface-400 font-medium hover:text-primary-500 transition-colors"
          >
            Choose different image
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </div>
  );
}
