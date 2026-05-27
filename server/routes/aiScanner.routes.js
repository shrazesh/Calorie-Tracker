/**
 * Purpose: Define routes for the AI Scanner system.
 * Endpoints: POST /scan, POST /confirm.
 */

import express from 'express';
import * as aiScannerController from '../controllers/aiScanner.controller.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// POST /api/ai-scanner/scan - Scan food image, run detection, return matched items, suggestions, and tips
router.post('/scan', auth, upload, aiScannerController.scanImage);

// POST /api/ai-scanner/confirm - Log confirmed food item(s) from AI scan
router.post('/confirm', auth, aiScannerController.confirmScan);

export default router;
