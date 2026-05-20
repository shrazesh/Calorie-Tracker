import express from 'express';
import auth from '../middleware/auth.js';
import { getProfile, updateProfile, calculateAndSaveGoal } from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/update', auth, updateProfile);
router.post('/calculate-goal', auth, calculateAndSaveGoal);

export default router;
