/**
 * Purpose: Provide dietary advice, alternative swaps, and additions.
 * Inputs: Scanned food items and aggregated macros.
 * Outputs: Nutrition tips, balance scores, and alternative swaps.
 */

import { getHealthierSwap } from './recommendationService.js';

class AiRecommendationService {
  /**
   * Analyze scanned meal macros and generate tips.
   * @param {Array} scannedFoods - Array of matched food items with quantity
   * @param {Object} totalMacros - Accumulated macros { calories, protein, carbs, fat, fiber }
   * @param {Object} user - User profile object
   * @returns {Object} { tips: Array<string>, healthScore: number, swaps: Array<Object> }
   */
  async generateAiNutritionTips(scannedFoods, totalMacros, user) {
    const tips = [];
    let healthScore = 8; // Default base score out of 10

    const { calories, protein, carbs, fat, fiber } = totalMacros;

    if (calories > 0) {
      const fatCal = fat * 9;
      const carbCal = carbs * 4;
      const protCal = protein * 4;
      
      const fatPct = (fatCal / calories) * 100;
      const carbPct = (carbCal / calories) * 100;
      const protPct = (protCal / calories) * 100;

      // 1. Analyze Fat
      if (fatPct > 40) {
        tips.push("This meal is high in fat. Consider balancing it with low-fat sides like fresh vegetables or steamed grains.");
        healthScore -= 1.5;
      }

      // 2. Analyze Carbs
      if (carbPct > 65) {
        tips.push("High carb proportion detected. Adding a lean protein source will help stabilize blood sugar levels.");
        healthScore -= 1;
      }

      // 3. Analyze Protein
      if (protein < 15) {
        tips.push("Low protein content. Consider adding boiled eggs, tofu, chicken breast, or double-serving lentils to meet your muscle recovery needs.");
        healthScore -= 1.5;
      } else if (protPct > 30) {
        tips.push("Excellent protein concentration! Great for muscle preservation and satiety.");
        healthScore += 1;
      }

      // 4. Analyze Fiber
      if (fiber < 3) {
        tips.push("This meal is low in dietary fiber. Try incorporating greens, whole wheat options, or seeds to support digestion.");
        healthScore -= 1;
      } else if (fiber >= 8) {
        tips.push("Fantastic fiber content! This will keep you feeling full and support gut health.");
        healthScore += 1;
      }
    }

    // Cap health score between 1 and 10
    healthScore = Math.max(2, Math.min(10, Math.round(healthScore * 10) / 10));

    // 5. Gather healthier swaps for each unique scanned food name
    const swaps = [];
    const processedNames = new Set();
    
    for (const food of scannedFoods) {
      const name = food.name;
      if (name && !processedNames.has(name)) {
        processedNames.add(name);
        try {
          const foodSwaps = await getHealthierSwap(name);
          if (foodSwaps && foodSwaps.length > 0) {
            swaps.push({
              originalFood: name,
              options: foodSwaps.map(item => ({
                id: item._id,
                name: item.name,
                display_name: item.display_name,
                calories_per_100g: item.calories_per_100g,
                protein_g: item.protein_g,
                carbs_g: item.carbs_g,
                fats_g: item.fats_g,
                fiber_g: item.fiber_g,
                servings: item.servings
              }))
            });
          }
        } catch (err) {
          console.error(`Error loading swap suggestions for "${name}":`, err.message);
        }
      }
    }

    return {
      tips,
      healthScore,
      swaps
    };
  }
}

export default new AiRecommendationService();
