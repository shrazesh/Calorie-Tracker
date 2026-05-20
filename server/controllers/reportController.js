import FoodEntry from '../models/FoodEntry.js';

export const getDailyReport = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const entries = await FoodEntry.find({ userId: req.user.id, date: { $gte: start, $lte: end } });
    
    const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
    const categoryBreakdown = entries.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.calories; return acc; }, {});
    
    res.json({ totalCalories, entryCount: entries.length, categoryBreakdown, entries });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const getWeeklyReport = async (req, res) => {
  try {
    const start = new Date(); start.setDate(start.getDate() - 7);
    const entries = await FoodEntry.find({ userId: req.user.id, date: { $gte: start } });
    
    const dailyData = {};
    for(let i=0; i<7; i++) {
        let d = new Date(start); d.setDate(d.getDate() + i);
        dailyData[d.toISOString().split('T')[0]] = { calories: 0, entries: 0 };
    }
    entries.forEach(e => {
        let k = new Date(e.date).toISOString().split('T')[0];
        if(dailyData[k]) { dailyData[k].calories += e.calories; dailyData[k].entries += 1; }
    });
    
    res.json({ dailyData, avgCalories: Math.round(entries.reduce((s, e) => s + e.calories, 0)/7) || 0, totalEntries: entries.length });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const getMonthlyReport = async (req, res) => {
  try {
      const start = new Date(); start.setDate(1);
      const entries = await FoodEntry.find({ userId: req.user.id, date: { $gte: start } });
      const dailyData = {};
      entries.forEach(e => {
          let k = new Date(e.date).toISOString().split('T')[0];
          if(!dailyData[k]) dailyData[k] = { calories: 0, entries: 0 };
          dailyData[k].calories += e.calories; dailyData[k].entries += 1;
      });
      res.json({ dailyData, totalCalories: entries.reduce((s, e) => s + e.calories, 0) });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};
