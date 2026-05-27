import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Initializing YOLOv8 neural engine...",
  "Scanning image for food clusters...",
  "Isolating boundaries...",
  "Analyzing composition...",
  "Fetching USDA nutrition database...",
  "Calculating serving sizes...",
  "Generating dietary tips..."
];

const ScanLoader = ({ imagePreview }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center py-10">
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden bg-slate-900 shadow-2xl mb-8 border-4 border-slate-800">
        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt="Scanning target" 
            className="w-full h-full object-cover opacity-60 grayscale-[30%]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Laser Scanner Animation */}
        <motion.div 
          className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_5px_rgba(52,211,153,0.5)] z-10"
          initial={{ top: '0%' }}
          animate={{ top: ['0%', '98%', '0%'] }}
          transition={{ 
            duration: 3, 
            ease: "easeInOut",
            repeat: Infinity
          }}
        />
        
        {/* Scanning Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      </div>

      <div className="h-8 relative w-full flex justify-center items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-emerald-600 font-medium absolute text-center w-full px-4"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
      
      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
};

export default ScanLoader;
