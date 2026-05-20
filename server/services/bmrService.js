/**
 * BMR Calculation Service
 * Uses the Mifflin–St Jeor Equation
 */

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

const GOAL_ADJUSTMENTS = {
  weight_loss: -500,
  weight_gain: +500,
  maintain: 0
};

/**
 * Calculate BMR using Mifflin–St Jeor Equation
 * @param {number} weight - kg
 * @param {number} height - cm
 * @param {number} age    - years
 * @param {string} gender - 'male' | 'female'
 * @returns {number} BMR in kcal/day
 */
export function calculateBMR(weight, height, age, gender) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Calculate TDEE from BMR and activity level
 * @param {number} bmr
 * @param {string} activityLevel
 * @returns {number} TDEE in kcal/day
 */
export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie goal from TDEE and user goal
 * @param {number} tdee
 * @param {string} goal - 'weight_loss' | 'weight_gain' | 'maintain'
 * @returns {number} Daily calorie goal
 */
export function calculateDailyCalorieGoal(tdee, goal) {
  const adjustment = GOAL_ADJUSTMENTS[goal] ?? 0;
  return Math.round(tdee + adjustment);
}

/**
 * Full calculation — returns bmr, tdee, dailyCalorieGoal
 * @param {{ weight, height, age, gender, activityLevel, goal }} params
 * @returns {{ bmr, tdee, dailyCalorieGoal }}
 */
export function computeCalorieGoal({ weight, height, age, gender, activityLevel, goal }) {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalorieGoal = calculateDailyCalorieGoal(tdee, goal);
  return { bmr, tdee, dailyCalorieGoal };
}
