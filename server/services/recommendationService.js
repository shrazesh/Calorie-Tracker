import FoodItem from "../models/FoodItem.js";

/**
 * Calculates the cosine similarity between two vectors.
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Creates a macro vector for a food item: [calories, protein, carbs, fat, fiber]
 */
export const createFoodVector = (food) => {
  return [
    food.calories_per_100g || 0,
    food.protein_g || 0,
    food.carbs_g || 0,
    food.fats_g || 0,
    food.fiber_g || 0
  ];
};

/**
 * Creates a target macro vector from a user profile: [calories, protein, carbs, fat, fiber]
 */
export const createTargetVector = (user) => {
  const targetCalories = user?.dailyCalorieGoal || user?.calorieGoal || 2000;
  const targetProtein = user?.macroTargets?.protein || Math.round(targetCalories * 0.30 / 4);
  const targetCarbs = user?.macroTargets?.carbs || Math.round(targetCalories * 0.40 / 4);
  const targetFat = user?.macroTargets?.fat || Math.round(targetCalories * 0.30 / 9);
  const targetFiber = 25; // Standard daily target for fiber
  return [targetCalories, targetProtein, targetCarbs, targetFat, targetFiber];
};

export const getRecommendations = async (deficit, user) => {
  const allFoods = await FoodItem.find({});
  const targetVector = createTargetVector(user);

  const scoredFoods = allFoods.map(food => {
    const foodVector = createFoodVector(food);
    const similarity = cosineSimilarity(targetVector, foodVector);
    return {
      food,
      similarity
    };
  });

  scoredFoods.sort((a, b) => b.similarity - a.similarity);

  // Return top 10 recommended foods
  return scoredFoods.slice(0, 10).map(item => item.food);
};

export const getHealthierSwap = async (foodName) => {
  const origFood = await FoodItem.findOne({ name: { $regex: `^${foodName}$`, $options: 'i' } });
  if (!origFood) {
    // If not in database, fallback to general high-density proteins/low-calorie foods
    return FoodItem.find().sort({ protein_g: -1, calories_per_100g: 1 }).limit(3);
  }

  return FoodItem.find({
    calories_per_100g: { $lt: origFood.calories_per_100g },
    protein_g: { $gt: origFood.protein_g }
  }).limit(3);
};

