/**
 * Purpose: Handle food recognition requests and log recognized meals.
 * Inputs: req.file (image), req.body (confirmation data).
 * Outputs: Recognition results or success status of logging.
 */

import mlService from '../services/mlService.js';
import FoodItem from '../models/FoodItem.js';
import FoodEntry from '../models/FoodEntry.js';
import User from '../models/User.js';

export const recognizeFoodFromImage = async (req, res) => {
  try {
    // 1. Check ML server health
    const isHealthy = await mlService.checkMLServerHealth();
    if (!isHealthy) {
      return res.status(503).json({ 
        success: false, 
        message: 'Food recognition service is currently offline. Please try again later or search manually.' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }

    // 2. Call ML Service
    const mlResult = await mlService.recognizeFood(
      req.file.buffer, 
      req.file.originalname, 
      req.file.mimetype
    );

    if (!mlResult.success) {
      throw new Error(mlResult.error || 'Unknown error during recognition');
    }

    // 3. Handle low confidence
    if (mlResult.low_confidence) {
      return res.json({
        success: true,
        low_confidence: true,
        message: 'Could not identify food clearly. Try better lighting or a closer shot, or select from suggestions below.',
        predictions: mlResult.predictions
      });
    }

    // 4. Find nutritional data in MongoDB
    const topLabel = mlResult.top_prediction;
    const matchedFood = await FoodItem.findOne({ cnn_label: topLabel });

    if (!matchedFood) {
      return res.json({
        success: true,
        low_confidence: false,
        predictions: mlResult.predictions,
        message: `Identified as ${topLabel.replace('_', ' ')}, but no nutritional data found.`,
        label_only: true
      });
    }

    // 5. Return success response
    res.json({
      success: true,
      low_confidence: false,
      predictions: mlResult.predictions,
      matched_food: {
        food_id: matchedFood._id,
        name: matchedFood.display_name,
        calories_per_100g: matchedFood.calories_per_100g,
        protein_g: matchedFood.protein_g,
        carbs_g: matchedFood.carbs_g,
        fats_g: matchedFood.fats_g,
        fiber_g: matchedFood.fiber_g,
        confidence_percent: mlResult.predictions[0].confidence_percent
      }
    });

  } catch (err) {
    console.error('Recognition Controller Error:', err);
    res.status(500).json({ success: false, message: 'Server error during food recognition.' });
  }
};

export const confirmRecognizedFood = async (req, res) => {
  try {
    const { food_item_id, meal_type, quantity_g, confidence } = req.body;

    const foodItem = await FoodItem.findById(food_item_id);
    if (!foodItem) {
      return res.status(404).json({ success: false, message: 'Food item not found.' });
    }

    const qty_g = Number(quantity_g || 100);
    const factor = qty_g / 100;

    const sourceNutrients = foodItem.nutrientsPer100g || {
      calories: foodItem.calories_per_100g || 0,
      protein: foodItem.protein_g || 0,
      carbs: foodItem.carbs_g || 0,
      fat: foodItem.fats_g || 0,
      fiber: foodItem.fiber_g || 0
    };

    const calories = Math.round((sourceNutrients.calories || foodItem.calories_per_100g || 0) * factor * 10) / 10;
    const protein = Math.round((sourceNutrients.protein || foodItem.protein_g || 0) * factor * 10) / 10;
    const carbs = Math.round((sourceNutrients.carbs || foodItem.carbs_g || 0) * factor * 10) / 10;
    const fat = Math.round((sourceNutrients.fat || foodItem.fats_g || 0) * factor * 10) / 10;
    const fiber = Math.round((sourceNutrients.fiber || foodItem.fiber_g || 0) * factor * 10) / 10;

    const entry = await FoodEntry.create({
      userId: req.user.id,
      food: foodItem._id,
      foodName: foodItem.display_name,
      servingLabel: '100 g',
      quantity: Math.round((qty_g / 100) * 100) / 100, // servings of 100g
      gramsTotal: qty_g,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      category: meal_type || 'Snacks',
      recognition_method: 'cnn_image',
      cnn_confidence: confidence
    });

    res.status(201).json({
      success: true,
      message: `${foodItem.display_name} (${qty_g}g) logged successfully!`,
      entry
    });

  } catch (err) {
    console.error('Confirmation Controller Error:', err);
    res.status(500).json({ success: false, message: 'Failed to log recognized meal.' });
  }
};
