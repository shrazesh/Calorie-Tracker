export const getTodayTotals = (logs) => {
  return logs.reduce((acc, f) => {
    acc.calories += (f.calories || 0);
    acc.protein += (f.protein || 0);
    acc.carbs += (f.carbs || 0);
    acc.fat += (f.fat || 0);
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};
