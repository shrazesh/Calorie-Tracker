import React, { useState, useEffect } from 'react';
import { Camera, Upload, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import UploadZone from './UploadZone';
import CameraCapture from './CameraCapture';
import ScanLoader from './ScanLoader';
import DetectionCard from './DetectionCard';
import MacroSummary from './MacroSummary';
import NutritionTips from './NutritionTips';
import PreviewModal from './PreviewModal';
import { scanFoodImage, confirmFoodScan } from '../../services/aiScannerApi';

const AiScannerCard = ({ onComplete }) => {
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'CAMERA' | 'SCANNING' | 'RESULTS'
  const [imagePreview, setImagePreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  
  // Detections state that the user can edit
  const [detections, setDetections] = useState([]);
  const [totals, setTotals] = useState(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Recalculate totals whenever detections change
  useEffect(() => {
    if (!detections.length) {
      setTotals(null);
      return;
    }
    
    let cals = 0, pro = 0, carbs = 0, fat = 0, fib = 0;
    detections.forEach(d => {
      const food = d.matchedFood;
      if (!food) return;
      const factor = (d.quantity || 1) / (food.serving_size_g || 100); // basic fallback calculation
      // Actually, if we have dynamic recalculation, we might just scale based on default quantity, 
      // but assuming the backend sends base values per default serving.
      // Let's keep it simple: multiply base values by quantity
      cals += (food.calories || 0) * (d.quantity || 1);
      pro += (food.protein_g || 0) * (d.quantity || 1);
      carbs += (food.carbs_g || 0) * (d.quantity || 1);
      fat += (food.fat_g || 0) * (d.quantity || 1);
      fib += (food.fiber_g || 0) * (d.quantity || 1);
    });
    
    setTotals({ calories: cals, protein_g: pro, carbs_g: carbs, fat_g: fat, fiber_g: fib });
  }, [detections]);

  const processImage = async (file) => {
    setImagePreview(URL.createObjectURL(file));
    setStep('SCANNING');
    
    try {
      const result = await scanFoodImage(file);
      setScanResult(result);
      setDetections(result.data.detections || []);
      setTotals(result.data.totals);
      setStep('RESULTS');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze image. Please try again.');
      setStep('INPUT');
      setImagePreview(null);
    }
  };

  const handleUpdateDetection = (updatedDetection) => {
    setDetections(prev => prev.map(d => 
      d.label === updatedDetection.label ? updatedDetection : d
    ));
  };

  const handleRemoveDetection = (labelToRemove) => {
    setDetections(prev => prev.filter(d => d.label !== labelToRemove));
  };

  const handleConfirmLog = async (mealType, date) => {
    if (!detections.length) {
      toast.error('No foods to log!');
      return;
    }

    setIsConfirming(true);
    try {
      const items = detections.map(d => ({
        foodItemId: d.matchedFood._id,
        quantity: d.quantity || 1,
        servingUnit: d.servingUnit || 'g',
        confidence: d.confidence
      }));

      await confirmFoodScan({
        items,
        mealType,
        date,
        overallConfidence: scanResult?.data?.overallConfidence || 1.0,
        imageUrl: scanResult?.data?.imageUrl
      });

      toast.success('Successfully logged food!');
      setShowConfirmModal(false);
      if (onComplete) onComplete();
    } catch (error) {
      console.error(error);
      toast.error('Failed to log food.');
    } finally {
      setIsConfirming(false);
    }
  };

  const resetScanner = () => {
    setStep('INPUT');
    setImagePreview(null);
    setScanResult(null);
    setDetections([]);
    setTotals(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        {step === 'RESULTS' && (
          <button 
            onClick={resetScanner}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-sm transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {step === 'INPUT' || step === 'CAMERA' ? 'Scan Food' : step === 'SCANNING' ? 'Analyzing' : 'Scan Results'}
          </h2>
          <p className="text-slate-500">
            {step === 'INPUT' || step === 'CAMERA' ? 'Use AI to instantly identify and log your meal' : step === 'SCANNING' ? 'Please wait while AI processes the image' : 'Review and confirm your meal components'}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 'INPUT' && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-500" />
                  Upload Photo
                </h3>
                <UploadZone onImageSelect={processImage} />
              </div>
              
              <div className="flex flex-col items-center justify-center border-l-0 md:border-l border-t md:border-t-0 border-slate-100 pt-8 md:pt-0 md:pl-8">
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-slate-700 mb-2 flex items-center justify-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-500" />
                    Take a Picture
                  </h3>
                  <p className="text-sm text-slate-500">Use your device camera for a quick scan</p>
                </div>
                <button 
                  onClick={() => setStep('CAMERA')}
                  className="w-full max-w-xs py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 transition-colors shadow-lg shadow-slate-900/20"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'CAMERA' && (
          <CameraCapture 
            key="camera"
            onCancel={() => setStep('INPUT')} 
            onCapture={processImage} 
          />
        )}

        {step === 'SCANNING' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
          >
            <ScanLoader imagePreview={imagePreview} />
          </motion.div>
        )}

        {step === 'RESULTS' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Image & Tips */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
                  <img src={imagePreview} alt="Scanned food" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <NutritionTips tips={scanResult?.data?.tips} />
            </div>

            {/* Right Column: Detections & Macros */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {detections.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center h-full">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No food detected</h3>
                  <p className="text-slate-500 max-w-sm mb-6">
                    We couldn't clearly identify food in this image. Please try taking a clearer photo or manually log your meal.
                  </p>
                  <button 
                    onClick={resetScanner}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors"
                  >
                    Try Another Photo
                  </button>
                </div>
              ) : (
                <>
                  <MacroSummary totals={totals} />
                  
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 px-2 flex justify-between items-end">
                      <span>Detected Items ({detections.length})</span>
                      <span className="text-sm font-normal text-slate-500">Edit quantities for accuracy</span>
                    </h3>
                    
                    {detections.map((detection, idx) => (
                      <DetectionCard 
                        key={`${detection.label}-${idx}`}
                        detection={detection}
                        onUpdate={handleUpdateDetection}
                        onRemove={() => handleRemoveDetection(detection.label)}
                      />
                    ))}
                  </div>

                  <div className="pt-4 sticky bottom-6 z-10">
                    <button 
                      onClick={() => setShowConfirmModal(true)}
                      disabled={detections.length === 0}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                      Continue to Log Meal
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmLog}
        isConfirming={isConfirming}
      />
    </div>
  );
};

export default AiScannerCard;
