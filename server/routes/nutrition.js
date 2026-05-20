import express from 'express';
import auth from '../middleware/auth.js';
import { getTodayMacroProgress } from '../utils/getTodayMacroProgress.js';

const router = express.Router();

// @route   GET /api/nutrition/today-macros
// @desc    Get user macronutrient progress for today
// @access  Private
router.get('/today-macros', auth, async (req, res) => {
  try {
    const progress = await getTodayMacroProgress(req.user.id);
    res.json(progress);
  } catch (err) {
    console.error("Error fetching today macros:", err);
    res.status(500).json({ message: "Server error calculating today's macros" });
  }
});

export default router;
