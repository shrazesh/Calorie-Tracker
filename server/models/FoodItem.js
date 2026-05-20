/**
 * Purpose: Schema for Food Items in the database.
 * Inputs: Food data (calories, protein, etc.)
 * Outputs: Mongoose model for FoodItem.
 */

import mongoose from 'mongoose';

const FoodItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  cnn_label: { 
    type: String, 
    required: true, 
    index: true // Indexed for fast lookup from CNN results
  },
  display_name: { 
    type: String, 
    required: true 
  },
  calories_per_100g: { 
    type: Number, 
    required: true 
  },
  protein_g: { 
    type: Number, 
    default: 0 
  },
  carbs_g: { 
    type: Number, 
    default: 0 
  },
  fats_g: { 
    type: Number, 
    default: 0 
  },
  fiber_g: { 
    type: Number, 
    default: 0 
  },
  nutrientsPer100g: {
    calories: { type: Number },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 }
  },
  servings: [
    {
      label: { type: String, required: true },
      grams: { type: Number, required: true }
    }
  ],
  category: { 
    type: String, 
    default: 'Uncategorized' 
  },
  image_url: { 
    type: String 
  },
  source: { 
    type: String, 
    enum: ["food101", "open_food_facts", "nepali_custom"],
    default: "food101"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save synchronization to guarantee 100% backward and forward compatibility
FoodItemSchema.pre('save', function(next) {
  if (!this.nutrientsPer100g) {
    this.nutrientsPer100g = {};
  }
  
  // Direct -> Nested
  if (this.calories_per_100g !== undefined) this.nutrientsPer100g.calories = this.calories_per_100g;
  if (this.protein_g !== undefined) this.nutrientsPer100g.protein = this.protein_g;
  if (this.carbs_g !== undefined) this.nutrientsPer100g.carbs = this.carbs_g;
  if (this.fats_g !== undefined) this.nutrientsPer100g.fat = this.fats_g;
  if (this.fiber_g !== undefined) this.nutrientsPer100g.fiber = this.fiber_g;

  // Nested -> Direct
  if (this.nutrientsPer100g.calories !== undefined) this.calories_per_100g = this.nutrientsPer100g.calories;
  if (this.nutrientsPer100g.protein !== undefined) this.protein_g = this.nutrientsPer100g.protein;
  if (this.nutrientsPer100g.carbs !== undefined) this.carbs_g = this.nutrientsPer100g.carbs;
  if (this.nutrientsPer100g.fat !== undefined) this.fats_g = this.nutrientsPer100g.fat;
  if (this.nutrientsPer100g.fiber !== undefined) this.fiber_g = this.nutrientsPer100g.fiber;

  // Ensure default "100 g" serving exists
  if (!this.servings) {
    this.servings = [];
  }
  const hasDefault = this.servings.some(s => s.label === "100 g" || s.grams === 100);
  if (!hasDefault) {
    this.servings.push({ label: "100 g", grams: 100 });
  }

  next();
});

const FoodItem = mongoose.model('FoodItem', FoodItemSchema);
export default FoodItem;
