import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import FoodEntry from '../models/FoodEntry.js';
import FoodItem from '../models/FoodItem.js';
import { getTodayTotals } from '../utils/getTodayTotals.js';
import { getDeficit } from '../utils/getDeficit.js';
import { getAlternatives, getTDEE, searchFood } from '../controllers/recommendationController.js';
import { cosineSimilarity, createFoodVector } from '../services/recommendationService.js';
import { getTodayMacroProgress } from '../utils/getTodayMacroProgress.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let { protein, carbs, fat } = req.query;
    let deficit;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch the macro progress calculations using our shared, single source of truth
    const progress = await getTodayMacroProgress(req.user.id);

    if (protein !== undefined && carbs !== undefined && fat !== undefined) {
      deficit = {
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        calories: Math.max(0, progress.calories.remaining)
      };
    } else {
      deficit = {
        protein: Math.max(0, progress.protein.remaining),
        carbs: Math.max(0, progress.carbs.remaining),
        fat: Math.max(0, progress.fat.remaining),
        calories: Math.max(0, progress.calories.remaining)
      };
    }

    // Build the user target macro vector based on daily needs
    const targetCalories = progress.calories.goal;
    const targetProtein = (protein !== undefined) ? Number(protein) : progress.protein.goal;
    const targetCarbs = (carbs !== undefined) ? Number(carbs) : progress.carbs.goal;
    const targetFat = (fat !== undefined) ? Number(fat) : progress.fat.goal;
    const targetFiber = 25; // Standard daily target for fiber
    const targetVector = [targetCalories, targetProtein, targetCarbs, targetFat, targetFiber];

    // Load all food items from MongoDB
    const allFoods = await FoodItem.find({});
    
    // Score all foods using vector similarity (cosine similarity)
    const scoredFoods = allFoods.map(food => {
      const foodVector = createFoodVector(food);
      const similarity = cosineSimilarity(targetVector, foodVector);
      return {
        ...food.toObject(),
        recommendationScore: Math.round(similarity * 100) // 0-100 scale
      };
    });

    // Sort by recommendationScore descending
    scoredFoods.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Return the top 10 recommended foods
    const top10 = scoredFoods.slice(0, 10);

    res.json({
      deficit,
      recommendedFoods: top10
    });
  } catch (err) {
    console.error("Optimized recommendations error:", err);
    res.status(500).json({ message: "Server error calculating optimized recommendations" });
  }
});

router.get('/alternatives/:foodName', auth, getAlternatives);
router.get('/tdee', auth, getTDEE);
router.get('/search', auth, searchFood);

export default router;
