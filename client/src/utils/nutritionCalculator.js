export const calculateNutritionByServing = (food, quantity, servingLabel) => {
  if (!food) return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, gramsTotal: 0 };

  const qty = parseFloat(quantity) || 1;
  const label = servingLabel || '100 g';
  
  const servingObj = food.servings?.find(s => s.label === label) || { grams: 100 };
  const servingGrams = servingObj.grams;
  const factor = (servingGrams * qty) / 100;

  return {
    calories: Math.round((food.calories_per_100g || 0) * factor),
    protein_g: Math.round((food.protein_g || 0) * factor * 10) / 10,
    carbs_g: Math.round((food.carbs_g || 0) * factor * 10) / 10,
    fat_g: Math.round((food.fats_g || 0) * factor * 10) / 10,
    fiber_g: Math.round((food.fiber_g || 0) * factor * 10) / 10,
    gramsTotal: servingGrams * qty
  };
};

export const calculateTotalNutrition = (detectedFoods) => {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let fiber = 0;

  if (!detectedFoods || !Array.isArray(detectedFoods)) {
    return { calories, protein_g: protein, carbs_g: carbs, fat_g: fat, fiber_g: fiber };
  }

  detectedFoods.forEach(d => {
    const firstFoodId = d.matchedFoods && d.matchedFoods.length > 0 ? (d.matchedFoods[0].id || d.matchedFoods[0]._id) : null;
    const activeFoodId = d.activeFoodId || firstFoodId;
    
    if (!activeFoodId || !d.matchedFoods) return;
    
    const food = d.matchedFoods.find(f => (f.id === activeFoodId) || (f._id === activeFoodId)) || d.matchedFoods[0];
    if (!food) return;

    const itemNutrition = calculateNutritionByServing(food, d.quantity, d.servingUnit);
    
    calories += itemNutrition.calories;
    protein += itemNutrition.protein_g;
    carbs += itemNutrition.carbs_g;
    fat += itemNutrition.fat_g;
    fiber += itemNutrition.fiber_g;
  });

  return {
    calories: Math.round(calories),
    protein_g: Math.round(protein * 10) / 10,
    carbs_g: Math.round(carbs * 10) / 10,
    fat_g: Math.round(fat * 10) / 10,
    fiber_g: Math.round(fiber * 10) / 10
  };
};
