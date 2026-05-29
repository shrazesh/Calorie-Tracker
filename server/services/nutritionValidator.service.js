/**
 * Purpose: Validates realistic nutrition boundaries for food categories.
 * This prevents the AI from assigning "Broccoli" nutrition to a "Burger"
 * if there is a mapping mistake or low confidence matching.
 */

class NutritionValidatorService {
  constructor() {
    // Definitive rules for what realistic macros look like per 100g for categories.
    // If a candidate food fails these rules, it's rejected.
    this.validationRules = {
      burger: { minCalories: 100, minProtein: 5, maxFiber: 20 },
      pizza: { minCalories: 100, minCarbs: 10, maxFiber: 15 },
      salad: { maxCalories: 300, maxFat: 25 },
      momo: { minCalories: 50, minCarbs: 5 },
      dal_bhat: { minCalories: 50, minCarbs: 10 },
      apple: { maxCalories: 150, maxFat: 5 },
      water: { maxCalories: 50 }
    };
  }

  /**
   * Determine the general category rule to apply based on the AI predicted label or food name.
   */
  getCategoryRule(label) {
    const lbl = label.toLowerCase();
    for (const key of Object.keys(this.validationRules)) {
      if (lbl.includes(key.replace('_', ' '))) {
        return this.validationRules[key];
      }
    }
    return null;
  }

  /**
   * Validates if a FoodItem's macros per 100g make sense for its classified label.
   * @param {Object} foodItem - The MongoDB FoodItem doc
   * @param {string} predictedLabel - The label predicted by the AI
   * @returns {boolean} True if macros are realistic, false if invalid.
   */
  isValidMacro(foodItem, predictedLabel) {
    const rule = this.getCategoryRule(predictedLabel) || this.getCategoryRule(foodItem.name);
    
    // If no specific rule exists, we assume it's valid to avoid over-filtering
    if (!rule) return true;

    const cals = foodItem.calories_per_100g || 0;
    const pro = foodItem.protein_g || 0;
    const carbs = foodItem.carbs_g || 0;
    const fat = foodItem.fats_g || 0;
    const fiber = foodItem.fiber_g || 0;

    if (rule.minCalories && cals < rule.minCalories) return false;
    if (rule.maxCalories && cals > rule.maxCalories) return false;
    if (rule.minProtein && pro < rule.minProtein) return false;
    if (rule.minCarbs && carbs < rule.minCarbs) return false;
    if (rule.maxFat && fat > rule.maxFat) return false;
    if (rule.maxFiber && fiber > rule.maxFiber) return false;

    return true;
  }
}

export default new NutritionValidatorService();
