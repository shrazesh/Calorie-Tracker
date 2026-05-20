/**
 * Purpose: Define API routes for food recognition.
 * Endpoints: POST /recognize, POST /confirm.
 */

import express from 'express';
import * as foodRecognitionController from '../controllers/foodRecognitionController.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// POST /api/food/recognize - Identify food from image
router.post('/recognize', auth, upload, foodRecognitionController.recognizeFoodFromImage);

// POST /api/food/recognize/confirm - Confirm and log the identified food
router.post('/confirm', auth, foodRecognitionController.confirmRecognizedFood);

export default router;
