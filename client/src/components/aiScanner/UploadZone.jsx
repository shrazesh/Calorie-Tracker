import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadZone = ({ onImageSelect }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    setError('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WEBP).');
      return false;
    }
    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onImageSelect(file);
      }
    }
  };

  return (
    <div className="w-full">
      <motion.div
        className={`relative w-full rounded-2xl border-2 border-dashed transition-colors duration-200 ease-in-out ${
          isDragActive 
            ? 'border-emerald-500 bg-emerald-50' 
            : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          title=""
        />
        
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <UploadCloud className={`w-10 h-10 ${isDragActive ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Drag & Drop your food photo
          </h3>
          <p className="text-slate-500 mb-4 max-w-xs text-sm">
            Or click to browse from your device. We support JPG, PNG, and WebP formats.
          </p>
          <button 
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-colors pointer-events-none"
            tabIndex={-1}
          >
            Select Photo
          </button>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-red-500 text-sm font-medium flex items-center justify-center overflow-hidden"
          >
            <X className="w-4 h-4 mr-1" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadZone;
