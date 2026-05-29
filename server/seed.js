import mongoose from 'mongoose';
import fs from 'fs/promises';
import 'dotenv/config';

import FoodItem from './models/FoodItem.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/caloriEE');
    console.log('✅ Connected to MongoDB');

    const data = await fs.readFile('./data/foodDataset.json', 'utf8');
    const rawFoods = JSON.parse(data);

    const foods = rawFoods.map(f => ({
      name: f.name,
      display_name: f.name,
      cnn_label: f.name.toLowerCase().replace(/ /g, '_'),
      calories_per_100g: f.calories || 0,
      protein_g: f.protein || 0,
      carbs_g: f.carbs || 0,
      fats_g: f.fat || f.fats || 0,
      fiber_g: f.fiber || 0,
      category: f.category || 'Uncategorized',
      servings: f.servings || [{ label: '100 g', grams: 100 }]
    }));

    await FoodItem.deleteMany();
    console.log('🗑️  Cleared existing food items');

    await FoodItem.insertMany(foods);
    console.log(`🌱 Successfully seeded ${foods.length} food items`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
