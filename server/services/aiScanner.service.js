/**
 * Purpose: Communcate with the python FastAPI AI Service.
 * Inputs: Image Buffer, filename, mimetype.
 * Outputs: List of detections (labels, confidence, bounding boxes).
 */

import axios from 'axios';
import FormData from 'form-data';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AiScannerService {
  /**
   * Send the uploaded image to the Python FastAPI server for food item detection.
   * @param {Buffer} imageBuffer - Express multer image buffer
   * @param {string} filename - Original name of uploaded image
   * @param {string} mimetype - Image file mimetype
   * @returns {Promise<Object>} Detection results from YOLOv8
   */
  async detectFoods(imageBuffer, filename, mimetype) {
    try {
      const form = new FormData();
      form.append('image', imageBuffer, { filename, contentType: mimetype });

      const response = await axios.post(`${AI_SERVICE_URL}/predict`, form, {
        headers: {
          ...form.getHeaders()
        },
        timeout: 15000 // Allow up to 15 seconds for model cold start/inference
      });

      return {
        success: true,
        detections: response.data.detections || []
      };
    } catch (error) {
      console.error('AI Scanner service request failed:', error.message);
      
      // Fallback: If python server is down or error occurs, log it and return empty detections
      // so the system degrades gracefully instead of crashing.
      return {
        success: false,
        error: error.message,
        detections: []
      };
    }
  }
}

export default new AiScannerService();
