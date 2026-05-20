import User from '../models/User.js';
import { computeCalorieGoal } from '../services/bmrService.js';
import { calcTargets } from '../utils/calcTargets.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };
    const { age, weight, height, activityLevel, gender, goal } = updates;

    // Auto-calculate BMR/TDEE/dailyCalorieGoal if all metrics are present
    if (age && weight && height && activityLevel && gender && goal) {
      const { bmr, tdee, dailyCalorieGoal } = computeCalorieGoal({
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        activityLevel,
        gender,
        goal
      });
      updates.bmr = bmr;
      updates.tdee = tdee;
      updates.dailyCalorieGoal = dailyCalorieGoal;
      updates.calorieGoal = dailyCalorieGoal; // keep legacy field in sync
      updates.macroTargets = calcTargets(dailyCalorieGoal);
      updates.profileComplete = true;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

/**
 * POST /api/user/calculate-goal
 * Standalone endpoint: accepts metrics, returns bmr/tdee/dailyCalorieGoal
 * and persists them to the user document.
 */
export const calculateAndSaveGoal = async (req, res) => {
  try {
    const { age, weight, height, activityLevel, gender, goal } = req.body;

    if (!age || !weight || !height || !activityLevel || !gender || !goal) {
      return res.status(400).json({ message: 'All fields (age, weight, height, activityLevel, gender, goal) are required.' });
    }

    const { bmr, tdee, dailyCalorieGoal } = computeCalorieGoal({
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      activityLevel,
      gender,
      goal
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        age: Number(age),
        weight: Number(weight),
        height: Number(height),
        activityLevel,
        gender,
        goal,
        bmr,
        tdee,
        dailyCalorieGoal,
        calorieGoal: dailyCalorieGoal,
        profileComplete: true,
        macroTargets: calcTargets(dailyCalorieGoal)
      },
      { new: true, runValidators: true }
    );

    res.json({ bmr, tdee, dailyCalorieGoal, user });
  } catch (err) {
    console.error('Calculate goal error:', err);
    res.status(500).json({ message: 'Error calculating goal' });
  }
};
