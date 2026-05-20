/**
 * Purpose: Frontend service to communicate with Node.js backend for food recognition.
 * Inputs: Image file, meal details.
 * Outputs: Recognition results, logging status.
 */

import api from '../utils/api';

/**
 * Upload an image to recognize food
 * @param {File} imageFile 
 */
export const recognizeFood = async (imageFile) => {
  const formData = new FormData();
  formData.append('foodImage', imageFile);

  try {
    const response = await api.post('/food-recognition/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Recognition Service Error:', err);
    throw err;
  }
};

/**
 * Confirm and log the recognized food
 * @param {Object} logData { food_item_id, meal_type, quantity_g, confidence }
 */
export const confirmFoodLog = async (logData) => {
  try {
    const response = await api.post('/food-recognition/confirm', logData);
    return response.data;
  } catch (err) {
    console.error('Log Confirmation Error:', err);
    throw err;
  }
};
