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
import { calculateTotalNutrition } from '../../utils/nutritionCalculator';

const AiScannerCard = ({ onComplete }) => {
  const [step, setStep] = useState('INPUT'); // 'INPUT' | 'CAMERA' | 'SCANNING' | 'RESULTS'
  const [imagePreview, setImagePreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  
  const [detections, setDetections] = useState([]);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Calculate totals using useMemo
  const totals = React.useMemo(() => {
    console.log('[DEBUG] Recalculating totals. Current detections state:', detections);
    const result = calculateTotalNutrition(detections);
    console.log('[DEBUG] Calculated totals:', result);
    return result;
  }, [detections]);

  const processImage = async (file) => {
    setImagePreview(URL.createObjectURL(file));
    setStep('SCANNING');
    
    try {
      const result = await scanFoodImage(file);
      setScanResult(result);
      setDetections(result.detections || []);
      // initialMacros from backend gets immediately overwritten by the accurate recalculation in useEffect, which is correct
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
      // Map to correct backend structure expected by confirmScan controller
      const meals = detections.map(d => {
        const firstFoodId = d.matchedFoods && d.matchedFoods.length > 0 ? (d.matchedFoods[0].id || d.matchedFoods[0]._id) : null;
        const activeFoodId = d.activeFoodId || firstFoodId;
        return {
          foodId: activeFoodId,
          quantity: d.quantity || 1,
          servingLabel: d.servingUnit || '100 g',
          customName: d.label,
          confidence: d.confidence
        };
      });

      await confirmFoodScan({
        meals,
        category: mealType,
        date,
        confidenceScore: 0.9, // Default overall confidence
        imageUrl: scanResult?.imageUrl
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
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
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
            className="grid lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Image & Tips (col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
                <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100">
                  <img src={imagePreview} alt="Scanned food" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <NutritionTips tips={scanResult?.tips} />
            </div>

            {/* Right Column: Detections & Macros (col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
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
                  <MacroSummary totals={totals} healthScore={scanResult?.healthScore} />
                  
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
