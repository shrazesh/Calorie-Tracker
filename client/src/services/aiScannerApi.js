/**
 * Purpose: Frontend service to communicate with Node.js backend for AI Food Scanner.
 * Inputs: Image file, meal details.
 * Outputs: Detection results, macros, logging status.
 */

import api from '../utils/api';

/**
 * Upload an image to the AI Scanner to detect food
 * @param {File} imageFile 
 */
export const scanFoodImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('foodImage', imageFile);

  try {
    const response = await api.post('/ai-scanner/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (err) {
    console.error('AI Scanner Service Error:', err);
    throw err;
  }
};

/**
 * Confirm and log the AI recognized food
 * @param {Object} scanPayload Details of the confirmed scan
 */
export const confirmFoodScan = async (scanPayload) => {
  try {
    const response = await api.post('/ai-scanner/confirm', scanPayload);
    return response.data;
  } catch (err) {
    console.error('Scan Confirmation Error:', err);
    throw err;
  }
};
