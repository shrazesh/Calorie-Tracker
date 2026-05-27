import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const CameraCapture = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [imagePreview, setImagePreview] = useState(null);

  const startCamera = useCallback(async (currentFacingMode) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions.");
    }
  }, [stream]);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Handle mirroring for front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImagePreview(imageDataUrl);
  };

  const handleConfirm = () => {
    if (imagePreview) {
      // Convert DataURL to File object
      fetch(imagePreview)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
          onCapture(file);
        });
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-auto md:aspect-[3/4]">
        
        {/* Header Actions */}
        <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/70 to-transparent">
          <button 
            onClick={onCancel}
            className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {!imagePreview && (
            <button 
              onClick={toggleCamera}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Viewport */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-zinc-900">
          {error ? (
            <div className="text-white text-center p-6">
              <p className="text-red-400 mb-2">{error}</p>
              <button 
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-emerald-600 rounded-full text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Target Overlay (only when scanning) */}
          {!imagePreview && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl -mb-1 -mr-1" />
              </div>
            </div>
          )}
        </div>

        {/* Controls Bottom */}
        <div className="h-32 bg-black flex items-center justify-center gap-8 pb-4">
          {imagePreview ? (
            <>
              <button 
                onClick={handleRetake}
                className="flex flex-col items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Retake</span>
              </button>
              
              <button 
                onClick={handleConfirm}
                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105"
              >
                <Check className="w-10 h-10 text-white" />
              </button>
            </>
          ) : (
            <button 
              onClick={takePhoto}
              className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center hover:border-white/50 transition-colors"
            >
              <div className="w-16 h-16 bg-white rounded-full transition-transform active:scale-95" />
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default CameraCapture;
