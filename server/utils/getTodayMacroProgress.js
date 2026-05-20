import FoodEntry from '../models/FoodEntry.js';
import User from '../models/User.js';
import { getTodayTotals } from './getTodayTotals.js';

export const getTodayMacroProgress = async (userId) => {
  const today = new Date();
  const start = new Date(today.setHours(0,0,0,0));
  const end = new Date(today.setHours(23,59,59,999));
  
  const logs = await FoodEntry.find({ userId, date: { $gte: start, $lte: end } });
  const totals = getTodayTotals(logs);
  
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const goalCalories = user.calorieGoal || user.dailyCalorieGoal || user.macroTargets?.calories || 2000;
  const goalProtein = user.proteinGoal || user.macroTargets?.protein || Math.round(goalCalories * 0.30 / 4);
  const goalCarbs = user.carbGoal || user.macroTargets?.carbs || Math.round(goalCalories * 0.40 / 4);
  const goalFat = user.fatGoal || user.macroTargets?.fat || Math.round(goalCalories * 0.30 / 9);

  const pConsumed = totals.protein || 0;
  const cConsumed = totals.carbs || 0;
  const fConsumed = totals.fat || 0;
  const calConsumed = totals.calories || 0;

  // Let remaining represent exact remaining values (can go negative if overconsumed, but we cap macro deficit at 0 elsewhere if needed)
  const pRemaining = goalProtein - pConsumed;
  const cRemaining = goalCarbs - cConsumed;
  const fRemaining = goalFat - fConsumed;
  const calRemaining = goalCalories - calConsumed;

  const pPercent = goalProtein > 0 ? (pConsumed / goalProtein) * 100 : 0;
  const cPercent = goalCarbs > 0 ? (cConsumed / goalCarbs) * 100 : 0;
  const fPercent = goalFat > 0 ? (fConsumed / goalFat) * 100 : 0;
  const calPercent = goalCalories > 0 ? (calConsumed / goalCalories) * 100 : 0;

  return {
    protein: {
      consumed: Math.round(pConsumed * 10) / 10,
      goal: goalProtein,
      remaining: Math.round(pRemaining * 10) / 10,
      percentage: Math.round(pPercent * 10) / 10
    },
    carbs: {
      consumed: Math.round(cConsumed * 10) / 10,
      goal: goalCarbs,
      remaining: Math.round(cRemaining * 10) / 10,
      percentage: Math.round(cPercent * 10) / 10
    },
    fat: {
      consumed: Math.round(fConsumed * 10) / 10,
      goal: goalFat,
      remaining: Math.round(fRemaining * 10) / 10,
      percentage: Math.round(fPercent * 10) / 10
    },
    calories: {
      consumed: Math.round(calConsumed * 10) / 10,
      goal: goalCalories,
      remaining: Math.round(calRemaining * 10) / 10,
      percentage: Math.round(calPercent * 10) / 10
    }
  };
};
