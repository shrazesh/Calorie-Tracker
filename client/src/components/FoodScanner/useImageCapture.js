/**
 * Purpose: Custom hook for image capture and file upload logic.
 * Inputs: Event or stream control.
 * Outputs: File objects, preview URLs, camera controls.
 */

import { useState, useCallback } from 'react';

export const useImageCapture = () => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Handle file selection from local device
   */
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Please select a JPG or PNG image.');
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  /**
   * Reset state
   */
  const resetCapture = useCallback(() => {
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  return {
    imageFile,
    previewUrl,
    error,
    handleFileSelect,
    resetCapture,
    setError
  };
};
