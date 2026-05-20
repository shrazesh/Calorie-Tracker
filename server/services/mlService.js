/**
 * Purpose: Encapsulate all communication with the Python FastAPI ML server.
 * Inputs: Image buffer, food labels.
 * Outputs: Predictions, health status.
 */

import axios from 'axios';
import FormData from 'form-data';

const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8000';

class MLService {
  /**
   * Check if ML server is alive
   */
  async checkMLServerHealth() {
    try {
      const response = await axios.get(`${ML_SERVER_URL}/health`, { timeout: 2000 });
      return response.data.status === 'ok';
    } catch (err) {
      console.error('ML Server health check failed:', err.message);
      return false;
    }
  }

  /**
   * Send image to ML server for recognition
   */
  async recognizeFood(imageBuffer, filename, mimetype) {
    try {
      const form = new FormData();
      form.append('image', imageBuffer, { filename, contentType: mimetype });

      const response = await axios.post(`${ML_SERVER_URL}/predict`, form, {
        headers: {
          ...form.getHeaders()
        },
        timeout: 10000 // ML prediction might take some time
      });

      return response.data;
    } catch (err) {
      console.error('ML Recognition request failed:', err.message);
      throw new Error('ML Server is currently unavailable or returned an error.');
    }
  }

  /**
   * Get all supported labels from ML server
   */
  async getSupportedFoodLabels() {
    try {
      const response = await axios.get(`${ML_SERVER_URL}/labels`);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch food labels:', err.message);
      return [];
    }
  }
}

const mlServiceInstance = new MLService();
export default mlServiceInstance;
