/**
 * Purpose: Provide dynamic serving size scaling and macro calculations.
 * Inputs: FoodItem, quantity, serving label, relative_area (optional).
 * Outputs: Scaled nutritional values.
 */

class ServingCalculatorService {
  /**
   * Calculate macronutrients for a food item given a quantity and serving option.
   * @param {Object} foodItem - The FoodItem document from MongoDB
   * @param {number} quantity - The numeric quantity (e.g. 1.5, 2)
   * @param {string} servingLabel - The serving label (e.g. "1 bowl", "100 g")
   * @param {number} [relativeArea=null] - Optional bounding box area relative to whole image (0.0 to 1.0)
   * @returns {Object} Calculated nutrition { calories, protein, carbs, fat, fiber, gramsTotal }
   */
  calculateNutritionByServing(foodItem, quantity, servingLabel = '100 g', relativeArea = null) {
    let qty = parseFloat(quantity) || 1;
    
    // If AI provides relative bounding box area, use it to tweak the default serving size
    // Example heuristic: if box is huge (>50% of image), it's probably a large serving
    // This only applies if the user hasn't manually tweaked it (we assume first AI pass is qty=1)
    if (relativeArea !== null && qty === 1) {
        if (relativeArea > 0.6) qty = 1.5;      // Very large portion
        else if (relativeArea < 0.15) qty = 0.5; // Very small portion
    }
    
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
      gramsTotal,
      suggestedQuantity: qty // pass back the AI-suggested quantity
    };
  }
}

export default new ServingCalculatorService();
