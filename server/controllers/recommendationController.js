import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import FoodEntry from '../models/FoodEntry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDataset() {
  const datasetPath = path.join(__dirname, '../data/foodDataset.json');
  return JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
}

// Helper: Calculate TDEE using Mifflin-St Jeor
function calculateTDEE(user) {
  if (!user.age || !user.weight || !user.height) return null;
  
  // Basic BMR
  let bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age);
  bmr += user.gender === 'male' ? 5 : -161;

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const tdee = bmr * (multipliers[user.activityLevel] || 1.2);
  
  return { bmr: Math.round(bmr), tdee: Math.round(tdee) };
}

// Helper: Calculate Cosine Similarity between two arrays of tags
function calculateSimilarity(itemA, itemB) {
  const tagsA = itemA.tags || [];
  const tagsB = itemB.tags || [];
  
  // Base similarity from tags
  const uniqueTags = Array.from(new Set([...tagsA, ...tagsB]));
  if (uniqueTags.length === 0) return 0;

  const vectorA = uniqueTags.map(tag => tagsA.includes(tag) ? 1 : 0);
  const vectorB = uniqueTags.map(tag => tagsB.includes(tag) ? 1 : 0);
  
  let dotProduct = 0, magA = 0, magB = 0;
  for (let i = 0; i < uniqueTags.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magA += vectorA[i] ** 2;
    magB += vectorB[i] ** 2;
  }
  
  let similarity = (magA === 0 || magB === 0) ? 0 : dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));

  // Category Boost: Much more likely to be a "similar" food if in the same category
  if (itemA.category === itemB.category) {
    similarity += 0.4;
  }

  // Healthy Snack Swap: If eating a less healthy snack, prioritize fruits
  if (itemA.category === 'Snacks' && itemA.healthScore < 6 && itemB.tags.includes('fruit')) {
    similarity += 0.5;
  }

  // Health Score Jump Boost: Reward significantly healthier options
  const healthDiff = itemB.healthScore - itemA.healthScore;
  if (healthDiff > 0) {
    similarity += (healthDiff / 10) * 0.3; // Boost up to 0.3 based on how much healthier it is
  }

  return similarity;
}

export const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get today's foods
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const todayEntries = await FoodEntry.find({ userId: user._id, date: { $gte: start, $lte: end } });
    
    let totalCalories = 0;
    const foodDataset = getDataset();
    
    // Find alternatives for less healthy items eaten today
    const alternatives = [];
    const alerts = [];
    const recommendations = [];
    
    const suggestedFoodNames = new Set();
    
    todayEntries.forEach(entry => {
      totalCalories += entry.calories;
      
      // Look up entry in dataset to get its health status
      const datasetItem = foodDataset.find(f => f.name.toLowerCase() === entry.foodName.toLowerCase());
      
      if (datasetItem && datasetItem.healthScore < 6) {
        // Find healthier alternatives based on similarity, excluding already suggested ones
        const possibleAlts = foodDataset.filter(f => 
          f.healthScore > datasetItem.healthScore && 
          f.name !== datasetItem.name &&
          !suggestedFoodNames.has(f.name)
        );
        
        let bestAlts = possibleAlts.map(alt => ({
          name: alt.name,
          calories: alt.calories,
          similarity: Math.round(calculateSimilarity(datasetItem, alt) * 100)
        }))
        .filter(alt => alt.similarity > 35) // Increased threshold for quality
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 2); // Top 2 alternatives
        
        if (bestAlts.length > 0) {
          bestAlts.forEach(alt => suggestedFoodNames.add(alt.name));
          alternatives.push({ original: entry.foodName, alternatives: bestAlts });
        }
      }
    });
    
    // Rule-based analysis
    if (totalCalories > user.calorieGoal) {
      alerts.push(`You are over your daily goal by ${totalCalories - user.calorieGoal} calories.`);
    } else if (user.calorieGoal - totalCalories > 500 && todayEntries.length > 0) {
      recommendations.push({
        title: 'Calorie Deficit Alert',
        reason: 'You have a large calorie deficit today. Consider eating nutrient-dense snacks to reach your goal.',
        foods: foodDataset.filter(f => f.healthScore >= 8 && f.category === 'Snacks').slice(0, 3)
      });
    }

    if (alternatives.length > 0) {
      recommendations.push({
        title: 'Healthier Choices',
        reason: 'We noticed some room for improvement in today\'s meals. Check the alternatives section!',
        foods: []
      });
    }

    // TDEE Logic
    const tdeeData = calculateTDEE(user);
    if (tdeeData) {
      tdeeData.recommendation = totalCalories < user.calorieGoal 
        ? "You're on track for weight loss!" 
        : "You might exceed maintenance calories today.";
    }
    
    res.json({ recommendations, alerts, alternatives, tdee: tdeeData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
};

export const getAlternatives = async (req, res) => {
  try {
    const foodDataset = getDataset();
    const foodName = req.params.foodName;
    const datasetItem = foodDataset.find(f => f.name.toLowerCase() === foodName.toLowerCase());
    
    if (!datasetItem) return res.json({ alternatives: [] });
    
    const possibleAlts = foodDataset.filter(f => f.healthScore > datasetItem.healthScore && f.name !== datasetItem.name);
    
    let bestAlts = possibleAlts.map(alt => ({
      name: alt.name,
      calories: alt.calories,
      similarity: Math.round(calculateSimilarity(datasetItem, alt) * 100)
    }))
    .filter(alt => alt.similarity > 35)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
    
    res.json({ alternatives: bestAlts });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching alternatives' });
  }
};

export const getTDEE = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tdeeData = calculateTDEE(user);
    if (!tdeeData) return res.status(400).json({ message: 'Missing physical metrics in profile' });
    
    tdeeData.recommendation = "This is your estimated maintenance energy.";
    res.json(tdeeData);
  } catch (err) {
    res.status(500).json({ message: 'Error calculating TDEE' });
  }
};

export const searchFood = (req, res) => {
  try {
    const foodDataset = getDataset();
    res.json({ results: foodDataset.filter(f => f.name.toLowerCase().includes(req.query.q.toLowerCase())) });
  } catch (err) {
    res.status(500).json({ message: 'Error searching dataset' });
  }
};
