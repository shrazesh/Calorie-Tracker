/**
 * Helper to parse raw USDA FoodData Central (FDC) JSON payloads
 * into the Cronometer serving size schema.
 */
export const parseUsdaFood = (fdcFood) => {
  if (!fdcFood) return null;

  const nutrients = fdcFood.foodNutrients || [];
  
  // Find nutrient value per 100g by standard nutrient names or FDC IDs
  const findNutrient = (names, ids) => {
    const match = nutrients.find(n => {
      const name = n.nutrient?.name?.toLowerCase() || n.nutrientName?.toLowerCase() || '';
      const id = n.nutrient?.id || n.nutrientId || 0;
      return names.some(nm => name.includes(nm)) || ids.includes(id);
    });
    // Support FDC's varied payload shapes for actual nutrient value
    return match ? (match.amount !== undefined ? match.amount : (match.value !== undefined ? match.value : 0)) : 0;
  };

  const calories = findNutrient(['energy', 'calorie'], [1008, 2047, 2048]);
  const protein = findNutrient(['protein'], [1003]);
  const carbs = findNutrient(['carbohydrate'], [1005]);
  const fat = findNutrient(['total lipid', 'fat'], [1004]);
  const fiber = findNutrient(['fiber', 'dietary'], [1079]);

  const nutrientsPer100g = {
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    fiber: Number(fiber) || 0
  };

  // Default serving is always 100 g
  const servings = [{ label: "100 g", grams: 100 }];

  // Extract household portions or measurements
  const portions = fdcFood.foodPortions || fdcFood.portions || [];
  portions.forEach(p => {
    const amount = p.amount || 1;
    const modifier = p.modifier || p.description || '';
    const grams = p.gramWeight || p.value || 0;

    if (grams > 0) {
      let label = '';
      if (modifier) {
        label = `${amount} ${modifier}`;
      } else if (p.householdServingFullText) {
        label = p.householdServingFullText;
      } else {
        label = `1 serving (${grams}g)`;
      }
      
      // Ensure label is clean and prevent duplicate names
      if (!servings.some(s => s.label.toLowerCase() === label.toLowerCase())) {
        servings.push({
          label,
          grams: Math.round(Number(grams) * 10) / 10
        });
      }
    }
  });

  // Check if serving info is stored directly as top-level fields (common in Branded Foods search payloads)
  if (fdcFood.householdServingFullText && fdcFood.servingSize) {
    const label = fdcFood.householdServingFullText;
    const grams = fdcFood.servingSize;
    if (!servings.some(s => s.label.toLowerCase() === label.toLowerCase())) {
      servings.push({
        label,
        grams: Math.round(Number(grams) * 10) / 10
      });
    }
  }

  return {
    name: fdcFood.description || fdcFood.name || "Unknown Food",
    nutrientsPer100g,
    servings
  };
};
