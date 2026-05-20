/**
 * Purpose: Seed MongoDB with data from the existing foodDataset.json.
 * Maps names to CNN labels for recognition.
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Load the JSON dataset
const datasetPath = './server/data/foodDataset.json';
const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

/**
 * Map food name to CNN labels (Food-101 compatible)
 */
function getCnnLabel(name) {
  const n = name.toLowerCase();
  if (n.includes('pizza')) return 'pizza';
  if (n.includes('burger')) return 'hamburger';
  if (n.includes('sushi')) return 'sushi';
  if (n.includes('momo')) return 'momo';
  if (n.includes('oatmeal')) return 'oatmeal';
  if (n.includes('apple')) return 'apple';
  if (n.includes('banana')) return 'banana';
  if (n.includes('rice')) return 'rice';
  if (n.includes('dal bhat')) return 'dal_bhat';
  if (n.includes('steak')) return 'steak';
  if (n.includes('salmon')) return 'salmon';
  if (n.includes('chicken wings')) return 'chicken_wings';
  if (n.includes('salad')) return 'salad';
  
  // Default: slugify name
  return n.replace(/\s+/g, '_').replace(/[^\w]/g, '');
}

/**
 * Get realistic USDA-sourced macronutrients for seeded foods.
 */
function getMacrosForFood(name, calories) {
  const n = name.toLowerCase();
  
  if (n.includes('oatmeal')) return { protein: 5, carbs: 27, fat: 2.5, fiber: 4 };
  if (n.includes('yogurt')) return { protein: 10, carbs: 3.6, fat: 4, fiber: 0 };
  if (n.includes('scrambled egg') || n.includes('scrambled eggs')) return { protein: 13, carbs: 1.1, fat: 15, fiber: 0 };
  if (n.includes('egg')) return { protein: 13, carbs: 1.1, fat: 12, fiber: 0 };
  if (n.includes('banana')) return { protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 };
  if (n.includes('chicken breast') || n.includes('sekuwa')) return { protein: 31, carbs: 0, fat: 3.6, fiber: 0 };
  if (n.includes('brown rice')) return { protein: 6, carbs: 64, fat: 2, fiber: 3.5 };
  if (n.includes('fried rice')) return { protein: 8, carbs: 80, fat: 12, fiber: 2 };
  if (n.includes('cheeseburger')) return { protein: 28, carbs: 40, fat: 30, fiber: 2 };
  if (n.includes('burger') || n.includes('hamburger')) return { protein: 25, carbs: 45, fat: 33, fiber: 2 };
  if (n.includes('steak')) return { protein: 26, carbs: 0, fat: 20, fiber: 0 };
  if (n.includes('salmon')) return { protein: 22, carbs: 0, fat: 13, fiber: 0 };
  if (n.includes('pepperoni pizza')) return { protein: 11, carbs: 28, fat: 12, fiber: 1.5 };
  if (n.includes('pizza')) return { protein: 12, carbs: 36, fat: 12, fiber: 1.8 };
  if (n.includes('apple')) return { protein: 0.3, carbs: 25, fat: 0.2, fiber: 4.4 };
  if (n.includes('chips')) return { protein: 2, carbs: 15, fat: 10, fiber: 1.2 };
  if (n.includes('water')) return { protein: 0, carbs: 0, fat: 0, fiber: 0 };
  if (n.includes('soda')) return { protein: 0, carbs: 39, fat: 0, fiber: 0 };
  if (n.includes('dosa')) return { protein: 6, carbs: 55, fat: 12, fiber: 2.5 };
  if (n.includes('sushi')) return { protein: 8, carbs: 38, fat: 2, fiber: 1 };
  if (n.includes('brownie')) return { protein: 4, carbs: 50, fat: 15, fiber: 2 };
  if (n.includes('tikka masala')) return { protein: 22, carbs: 15, fat: 25, fiber: 2 };
  if (n.includes('tacos')) return { protein: 12, carbs: 20, fat: 8, fiber: 2 };
  if (n.includes('croissant')) return { protein: 6, carbs: 30, fat: 15, fiber: 1.5 };
  if (n.includes('spaghetti') || n.includes('bolognese')) return { protein: 18, carbs: 65, fat: 15, fiber: 3 };
  if (n.includes('ramen')) return { protein: 22, carbs: 70, fat: 24, fiber: 2 };
  if (n.includes('fish and chips')) return { protein: 20, carbs: 85, fat: 32, fiber: 4 };
  if (n.includes('falafel')) return { protein: 12, carbs: 50, fat: 12, fiber: 6 };
  if (n.includes('pad thai')) return { protein: 15, carbs: 75, fat: 14, fiber: 2 };
  if (n.includes('salad')) return { protein: 5, carbs: 8, fat: 18, fiber: 2 };
  if (n.includes('biryani')) return { protein: 24, carbs: 65, fat: 16, fiber: 3 };
  if (n.includes('donut')) return { protein: 3, carbs: 32, fat: 12, fiber: 1 };
  if (n.includes('macaroni') || n.includes('mac and cheese')) return { protein: 15, carbs: 45, fat: 16, fiber: 2 };
  if (n.includes('ice cream')) return { protein: 3, carbs: 22, fat: 8, fiber: 0 };
  if (n.includes('steak frites')) return { protein: 35, carbs: 65, fat: 40, fiber: 3 };
  
  if (n.includes('chicken momo')) return { protein: 16, carbs: 45, fat: 12, fiber: 2 };
  if (n.includes('buff momo')) return { protein: 18, carbs: 45, fat: 14, fiber: 2 };
  if (n.includes('momo')) return { protein: 10, carbs: 35, fat: 8, fiber: 2 };
  if (n.includes('dal bhat tarkari')) return { protein: 20, carbs: 110, fat: 12, fiber: 8 };
  if (n.includes('dal bhat')) return { protein: 18, carbs: 95, fat: 10, fiber: 6 };
  if (n.includes('dhido')) return { protein: 14, carbs: 150, fat: 4, fiber: 12 };
  if (n.includes('saag vaat')) return { protein: 10, carbs: 85, fat: 6, fiber: 5 };
  if (n.includes('sel roti')) return { protein: 4, carbs: 55, fat: 8, fiber: 2 };
  if (n.includes('chatpate')) return { protein: 5, carbs: 40, fat: 8, fiber: 3 };
  if (n.includes('panipuri')) return { protein: 3, carbs: 28, fat: 6, fiber: 2 };
  if (n.includes('chowmein')) return { protein: 8, carbs: 68, fat: 14, fiber: 3 };
  if (n.includes('thakali')) return { protein: 28, carbs: 120, fat: 26, fiber: 8 };
  if (n.includes('gundruk')) return { protein: 12, carbs: 90, fat: 5, fiber: 6 };
  if (n.includes('samosa')) return { protein: 5, carbs: 38, fat: 16, fiber: 2 };
  if (n.includes('yomari')) return { protein: 6, carbs: 65, fat: 8, fiber: 2 };
  if (n.includes('bara') || n.includes('wo')) return { protein: 12, carbs: 32, fat: 4, fiber: 4 };
  if (n.includes('choila')) return { protein: 32, carbs: 6, fat: 18, fiber: 0 };
  if (n.includes('kheer')) return { protein: 8, carbs: 45, fat: 10, fiber: 0 };
  if (n.includes('aloo tama')) return { protein: 4, carbs: 22, fat: 6, fiber: 3 };
  if (n.includes('puri tarkari')) return { protein: 8, carbs: 58, fat: 18, fiber: 3 };
  if (n.includes('chiura') || n.includes('beaten rice')) return { protein: 2, carbs: 25, fat: 0.5, fiber: 1 };
  if (n.includes('laphing')) return { protein: 4, carbs: 38, fat: 3, fiber: 1 };
  if (n.includes('tea') || n.includes('chiya')) return { protein: 3, carbs: 14, fat: 2, fiber: 0 };

  const mockCarb = Math.round(calories * 0.1);
  const mockProtein = Math.round(calories * 0.03);
  const mockFat = Math.round(calories * 0.02);
  return { protein: mockProtein, carbs: mockCarb, fat: mockFat, fiber: Math.round(mockCarb * 0.05) };
}

function getServingsForFood(name) {
  const n = name.toLowerCase();
  const servings = [{ label: "100 g", grams: 100 }];
  
  if (n.includes('momo')) {
    servings.push({ label: "1 plate (10 momos)", grams: 250 });
    servings.push({ label: "1 momo", grams: 25 });
  } else if (n.includes('pizza')) {
    servings.push({ label: "1 slice (medium)", grams: 107 });
    servings.push({ label: "1 whole pizza (medium)", grams: 856 });
  } else if (n.includes('apple')) {
    servings.push({ label: "1 medium apple", grams: 182 });
    servings.push({ label: "1 cup, chopped", grams: 125 });
  } else if (n.includes('banana')) {
    servings.push({ label: "1 medium banana", grams: 118 });
    servings.push({ label: "1 cup, sliced", grams: 150 });
  } else if (n.includes('egg')) {
    servings.push({ label: "1 large egg", grams: 50 });
    servings.push({ label: "1 extra large egg", grams: 56 });
  } else if (n.includes('rice')) {
    servings.push({ label: "1 cup (cooked)", grams: 195 });
    servings.push({ label: "1 plate", grams: 350 });
  } else if (n.includes('steak')) {
    servings.push({ label: "1 steak (regular)", grams: 251 });
  } else if (n.includes('salmon')) {
    servings.push({ label: "1 fillet (medium)", grams: 150 });
    servings.push({ label: "1 steak (regular)", grams: 251 });
    servings.push({ label: "3 oz portion", grams: 85 });
    servings.push({ label: "1 oz", grams: 28.3 });
  } else if (n.includes('chicken breast') || n.includes('breast')) {
    servings.push({ label: "1 breast fillet", grams: 172 });
  } else if (n.includes('salad')) {
    servings.push({ label: "1 cup", grams: 75 });
    servings.push({ label: "1 bowl", grams: 200 });
  } else if (n.includes('milk')) {
    servings.push({ label: "1 cup (244ml)", grams: 244 });
    servings.push({ label: "1 glass", grams: 250 });
  } else if (n.includes('peanut butter')) {
    servings.push({ label: "1 tbsp", grams: 16 });
    servings.push({ label: "1 jar", grams: 454 });
  } else if (n.includes('sweet potato')) {
    servings.push({ label: "1 medium", grams: 150 });
  } else if (n.includes('quinoa')) {
    servings.push({ label: "1 cup (cooked)", grams: 185 });
  } else if (n.includes('almonds')) {
    servings.push({ label: "1 oz (23 almonds)", grams: 28 });
    servings.push({ label: "1 cup", grams: 143 });
  } else if (n.includes('broccoli')) {
    servings.push({ label: "1 cup, chopped", grams: 91 });
    servings.push({ label: "1 stalk", grams: 150 });
  } else if (n.includes('spinach')) {
    servings.push({ label: "1 cup, raw", grams: 30 });
    servings.push({ label: "1 bunch", grams: 340 });
  } else if (n.includes('blueberries')) {
    servings.push({ label: "1 cup", grams: 148 });
    servings.push({ label: "1 pint", grams: 300 });
  } else if (n.includes('bread')) {
    servings.push({ label: "1 slice", grams: 28 });
  } else if (n.includes('tofu')) {
    servings.push({ label: "1 block", grams: 340 });
    servings.push({ label: "1 oz", grams: 28 });
  } else if (n.includes('olive oil')) {
    servings.push({ label: "1 tbsp", grams: 13.5 });
    servings.push({ label: "1 tsp", grams: 4.5 });
  } else if (n.includes('soup')) {
    servings.push({ label: "1 cup", grams: 245 });
    servings.push({ label: "1 bowl", grams: 350 });
  } else if (n.includes('hummus')) {
    servings.push({ label: "1 tbsp", grams: 15 });
  } else if (n.includes('chocolate')) {
    servings.push({ label: "1 bar", grams: 100 });
    servings.push({ label: "1 square", grams: 10 });
  }
  
  return servings;
}

const formattedFoods = dataset.map(item => {
  const macros = getMacrosForFood(item.name, item.calories);
  return {
    name: item.name,
    cnn_label: getCnnLabel(item.name),
    display_name: item.name,
    calories_per_100g: item.calories,
    protein_g: macros.protein,
    carbs_g: macros.carbs,
    fats_g: macros.fat,
    fiber_g: macros.fiber,
    nutrientsPer100g: {
      calories: item.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      fiber: macros.fiber
    },
    servings: getServingsForFood(item.name),
    category: item.category,
    healthScore: item.healthScore,
    source: "nepali_custom",
    createdAt: new Date()
  };
});

const additionalUSDAFoods = [
  {
    name: "Avocado",
    cnn_label: "avocado",
    display_name: "Avocado",
    calories_per_100g: 160,
    protein_g: 2,
    carbs_g: 8.5,
    fats_g: 14.7,
    fiber_g: 6.7,
    category: "Snacks",
    healthScore: 10,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Peanut Butter",
    cnn_label: "peanut_butter",
    display_name: "Peanut Butter",
    calories_per_100g: 588,
    protein_g: 25,
    carbs_g: 20,
    fats_g: 50,
    fiber_g: 6,
    category: "Snacks",
    healthScore: 7,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Sweet Potato",
    cnn_label: "sweet_potato",
    display_name: "Sweet Potato",
    calories_per_100g: 86,
    protein_g: 1.6,
    carbs_g: 20,
    fats_g: 0.1,
    fiber_g: 3,
    category: "Lunch",
    healthScore: 9,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Quinoa (Cooked)",
    cnn_label: "quinoa",
    display_name: "Quinoa (Cooked)",
    calories_per_100g: 120,
    protein_g: 4.4,
    carbs_g: 21.3,
    fats_g: 1.9,
    fiber_g: 2.8,
    category: "Lunch",
    healthScore: 9,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Almonds",
    cnn_label: "almonds",
    display_name: "Almonds",
    calories_per_100g: 579,
    protein_g: 21,
    carbs_g: 22,
    fats_g: 49,
    fiber_g: 12,
    category: "Snacks",
    healthScore: 9,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Broccoli",
    cnn_label: "broccoli",
    display_name: "Broccoli",
    calories_per_100g: 34,
    protein_g: 2.8,
    carbs_g: 7,
    fats_g: 0.4,
    fiber_g: 2.6,
    category: "Dinner",
    healthScore: 10,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Spinach",
    cnn_label: "spinach",
    display_name: "Spinach",
    calories_per_100g: 23,
    protein_g: 2.9,
    carbs_g: 3.6,
    fats_g: 0.4,
    fiber_g: 2.2,
    category: "Lunch",
    healthScore: 10,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Blueberries",
    cnn_label: "blueberries",
    display_name: "Blueberries",
    calories_per_100g: 57,
    protein_g: 0.7,
    carbs_g: 14,
    fats_g: 0.3,
    fiber_g: 2.4,
    category: "Snacks",
    healthScore: 10,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Whole Wheat Bread",
    cnn_label: "whole_wheat_bread",
    display_name: "Whole Wheat Bread",
    calories_per_100g: 247,
    protein_g: 13,
    carbs_g: 41,
    fats_g: 3.4,
    fiber_g: 7,
    category: "Breakfast",
    healthScore: 8,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Tofu",
    cnn_label: "tofu",
    display_name: "Tofu",
    calories_per_100g: 76,
    protein_g: 8,
    carbs_g: 1.9,
    fats_g: 4.8,
    fiber_g: 0.3,
    category: "Lunch",
    healthScore: 8,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "White Rice (Cooked)",
    cnn_label: "white_rice",
    display_name: "White Rice (Cooked)",
    calories_per_100g: 130,
    protein_g: 2.7,
    carbs_g: 28,
    fats_g: 0.3,
    fiber_g: 0.4,
    category: "Lunch",
    healthScore: 5,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Olive Oil",
    cnn_label: "olive_oil",
    display_name: "Olive Oil",
    calories_per_100g: 884,
    protein_g: 0,
    carbs_g: 0,
    fats_g: 100,
    fiber_g: 0,
    category: "Dinner",
    healthScore: 8,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Chicken Thigh (Cooked)",
    cnn_label: "chicken_thigh",
    display_name: "Chicken Thigh (Cooked)",
    calories_per_100g: 209,
    protein_g: 26,
    carbs_g: 0,
    fats_g: 10.9,
    fiber_g: 0,
    category: "Dinner",
    healthScore: 8,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Canned Tuna (in Water)",
    cnn_label: "canned_tuna",
    display_name: "Canned Tuna (in Water)",
    calories_per_100g: 116,
    protein_g: 26,
    carbs_g: 0,
    fats_g: 1,
    fiber_g: 0,
    category: "Lunch",
    healthScore: 9,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Protein Powder (Whey Plain)",
    cnn_label: "protein_powder",
    display_name: "Protein Powder (Whey Plain)",
    calories_per_100g: 385,
    protein_g: 80,
    carbs_g: 6,
    fats_g: 6,
    fiber_g: 0,
    category: "Snacks",
    healthScore: 9,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Chia Seeds",
    cnn_label: "chia_seeds",
    display_name: "Chia Seeds",
    calories_per_100g: 486,
    protein_g: 16.5,
    carbs_g: 42,
    fats_g: 30.7,
    fiber_g: 34.4,
    category: "Breakfast",
    healthScore: 10,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Cottage Cheese",
    cnn_label: "cottage_cheese",
    display_name: "Cottage Cheese",
    calories_per_100g: 98,
    protein_g: 11,
    carbs_g: 3.4,
    fats_g: 4.3,
    fiber_g: 0,
    category: "Breakfast",
    healthScore: 8,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Lentil Soup",
    cnn_label: "lentil_soup",
    display_name: "Lentil Soup",
    calories_per_100g: 56,
    protein_g: 4,
    carbs_g: 8,
    fats_g: 1,
    fiber_g: 2,
    category: "Dinner",
    healthScore: 9,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Hummus",
    cnn_label: "hummus",
    display_name: "Hummus",
    calories_per_100g: 166,
    protein_g: 7.9,
    carbs_g: 14.3,
    fats_g: 9.6,
    fiber_g: 6,
    category: "Snacks",
    healthScore: 8,
    source: "usda_official",
    createdAt: new Date()
  },
  {
    name: "Dark Chocolate (70-85%)",
    cnn_label: "dark_chocolate",
    display_name: "Dark Chocolate (70-85%)",
    calories_per_100g: 598,
    protein_g: 7.8,
    carbs_g: 46,
    fats_g: 43,
    fiber_g: 11,
    category: "Snacks",
    healthScore: 7,
    source: "usda_official",
    createdAt: new Date()
  }
];

const allFoods = [...formattedFoods, ...additionalUSDAFoods];

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db();
    const collection = db.collection('fooditems');

    // Clear existing
    await collection.deleteMany({});
    console.log("Cleared existing food items.");

    // Map and ensure servings and nutrientsPer100g are fully populated for native MongoDB insert
    const processedFoods = allFoods.map(food => {
      const servings = food.servings || getServingsForFood(food.name);
      return {
        ...food,
        nutrientsPer100g: food.nutrientsPer100g || {
          calories: food.calories_per_100g || 0,
          protein: food.protein_g || 0,
          carbs: food.carbs_g || 0,
          fat: food.fats_g || 0,
          fiber: food.fiber_g || 0
        },
        servings
      };
    });

    // Insert new
    const result = await collection.insertMany(processedFoods);
    console.log(`Successfully seeded ${result.insertedCount} food items with Cronometer-style servings & nutrients!`);
    
    process.exit(0);
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
