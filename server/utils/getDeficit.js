export const getDeficit = (target, total) => ({
  calories: (target.calories || 2000) - (total.calories || 0),
  protein: (target.protein || 150) - (total.protein || 0),
  carbs: (target.carbs || 200) - (total.carbs || 0),
  fat: (target.fat || 67) - (total.fat || 0),
});
