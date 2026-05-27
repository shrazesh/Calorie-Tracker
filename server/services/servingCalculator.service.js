/**
 * Purpose: Provide dynamic serving size scaling and macro calculations.
 * Inputs: FoodItem, quantity, serving label.
 * Outputs: Scaled nutritional values.
 */

class ServingCalculatorService {
  /**
   * Calculate macronutrients for a food item given a quantity and serving option.
   * @param {Object} foodItem - The FoodItem document from MongoDB
   * @param {number} quantity - The numeric quantity (e.g. 1.5, 2)
   * @param {string} servingLabel - The serving label (e.g. "1 bowl", "100 g")
   * @returns {Object} Calculated nutrition { calories, protein, carbs, fat, fiber, gramsTotal }
   */
  calculateNutritionByServing(foodItem, quantity, servingLabel = '100 g') {
    const qty = parseFloat(quantity) || 1;
    
    // Find the serving configuration
    let serving = foodItem.servings?.find(
      s => s.label.toLowerCase() === servingLabel.toLowerCase()
    );
    
    // Fallback: If serving configuration is missing, use default 100g
    if (!serving) {
      serving = { label: '100 g', grams: 100 };
    }
    
    // Calculate total grams
    const gramsTotal = Math.round((serving.grams * qty) * 10) / 10;
    const factor = gramsTotal / 100;
    
    // Get source nutrients per 100g
    const sourceNutrients = foodItem.nutrientsPer100g || {
      calories: foodItem.calories_per_100g || 0,
      protein: foodItem.protein_g || 0,
      carbs: foodItem.carbs_g || 0,
      fat: foodItem.fats_g || 0,
      fiber: foodItem.fiber_g || 0
    };
    
    // Dynamically scale based on total grams (factor)
    const calories = Math.round((sourceNutrients.calories || foodItem.calories_per_100g || 0) * factor * 10) / 10;
    const protein = Math.round((sourceNutrients.protein || foodItem.protein_g || 0) * factor * 10) / 10;
    const carbs = Math.round((sourceNutrients.carbs || foodItem.carbs_g || 0) * factor * 10) / 10;
    const fat = Math.round((sourceNutrients.fat || foodItem.fats_g || 0) * factor * 10) / 10;
    const fiber = Math.round((sourceNutrients.fiber || foodItem.fiber_g || 0) * factor * 10) / 10;
    
    return {
      calories,
      protein,
      carbs,
      fat,
      fiber,
      gramsTotal
    };
  }
}

export default new ServingCalculatorService();
