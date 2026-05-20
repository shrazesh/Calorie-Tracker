import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import FoodEntry from "../models/FoodEntry.js";
import { getTodayTotals } from "../utils/getTodayTotals.js";
import { getDeficit } from "../utils/getDeficit.js";
import { getRecommendations, getHealthierSwap } from "../services/recommendationService.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const today = new Date();
    const start = new Date(today.setHours(0,0,0,0));
    const end = new Date(today.setHours(23,59,59,999));
    
    // Fetch logs for the current user today
    const logs = await FoodEntry.find({ userId: req.user.id, date: { $gte: start, $lte: end } });
    const totals = getTodayTotals(logs);
    
    // Fetch complete user document to get macro targets
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const target = user.macroTargets || {
      calories: user.dailyCalorieGoal || user.calorieGoal || 2000,
      protein: Math.round((user.dailyCalorieGoal || user.calorieGoal || 2000) * 0.30 / 4),
      carbs: Math.round((user.dailyCalorieGoal || user.calorieGoal || 2000) * 0.40 / 4),
      fat: Math.round((user.dailyCalorieGoal || user.calorieGoal || 2000) * 0.30 / 9),
    };

    const deficit = getDeficit(target, totals);
    const foods = await getRecommendations(deficit, user);

    res.json({
      deficit,
      recommendedFoods: foods
    });
  } catch (err) {
    console.error("Recommendations error:", err);
    res.status(500).json({ message: "Server error calculating recommendations" });
  }
});

router.get("/swap/:foodName", auth, async (req, res) => {
  try {
    const foodName = req.params.foodName;
    const swaps = await getHealthierSwap(foodName);
    res.json({ swaps });
  } catch (err) {
    console.error("Swaps error:", err);
    res.status(500).json({ message: "Server error finding healthier swaps" });
  }
});

export default router;
