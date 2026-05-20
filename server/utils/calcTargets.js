export const calcTargets = (tdee) => ({
  calories: tdee,
  protein: Math.round(tdee * 0.30 / 4),
  carbs: Math.round(tdee * 0.40 / 4),
  fat: Math.round(tdee * 0.30 / 9),
});
