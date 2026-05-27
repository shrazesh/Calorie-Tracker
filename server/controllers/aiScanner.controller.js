/**
 * Purpose: Coordinate AI image scanning and save scanned meals.
 * Inputs: req.file (image), req.body (meal selection and custom logging values).
 * Outputs: Match candidates, nutritional totals, custom tips, and save confirmation.
 */

import fs from 'fs';
import path from 'path';
import aiScannerService from '../services/aiScanner.service.js';
import nutritionMatcherService from '../services/nutritionMatcher.service.js';
import servingCalculatorService from '../services/servingCalculator.service.js';
import aiRecommendationService from '../services/recommendation.service.js';
import FoodEntry from '../models/FoodEntry.js';
import FoodItem from '../models/FoodItem.js';

// Ensure uploads folder exists in server directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Handle image scan request.
 */
export const scanImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    // 1. Save file locally to server/uploads/ for persistent lookup
    const fileExt = path.extname(req.file.originalname) || '.jpg';
    const uniqueName = `scan-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    
    await fs.promises.writeFile(filePath, req.file.buffer);
    const imageUrl = `/uploads/${uniqueName}`;

    // 2. Call the Python FastAPI AI service
    const aiResult = await aiScannerService.detectFoods(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // If AI service failed, log and set empty detections (we fallback to user search)
    if (!aiResult.success) {
      console.warn("FastAPI service failure, entering graceful fallback:", aiResult.error);
    }

    const detections = aiResult.detections || [];
    
    // 3. For each detection, query database matches
    const formattedDetections = [];
    const matchedFoodsForTips = [];
    const initialMacros = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    for (const det of detections) {
      const dbMatches = await nutritionMatcherService.matchFoodToDb(det.label);
      
      if (dbMatches && dbMatches.length > 0) {
        const topMatch = dbMatches[0];
        matchedFoodsForTips.push(topMatch);

        // Calculate default macro contribution (assuming 1 serving of 100g)
        const defaults = servingCalculatorService.calculateNutritionByServing(topMatch, 1, '100 g');
        initialMacros.calories += defaults.calories;
        initialMacros.protein += defaults.protein;
        initialMacros.carbs += defaults.carbs;
        initialMacros.fat += defaults.fat;
        initialMacros.fiber += defaults.fiber;
        
        formattedDetections.push({
          label: det.label,
          confidence: det.confidence,
          confidence_percent: `${(det.confidence * 100).toFixed(1)}%`,
          bbox: det.bbox,
          matchedFoods: dbMatches.map(food => ({
            id: food._id,
            name: food.name,
            display_name: food.display_name,
            calories_per_100g: food.calories_per_100g,
            protein_g: food.protein_g,
            carbs_g: food.carbs_g,
            fats_g: food.fats_g,
            fiber_g: food.fiber_g,
            servings: food.servings,
            category: food.category
          }))
        });
      }
    }

    // Round aggregated initial macros
    initialMacros.calories = Math.round(initialMacros.calories);
    initialMacros.protein = Math.round(initialMacros.protein * 10) / 10;
    initialMacros.carbs = Math.round(initialMacros.carbs * 10) / 10;
    initialMacros.fat = Math.round(initialMacros.fat * 10) / 10;
    initialMacros.fiber = Math.round(initialMacros.fiber * 10) / 10;

    // 4. Generate AI Nutrition advice and alternative swaps
    const tipsResult = await aiRecommendationService.generateAiNutritionTips(
      matchedFoodsForTips,
      initialMacros,
      req.user
    );

    // 5. Return scan results
    return res.json({
      success: true,
      imageUrl,
      detections: formattedDetections,
      initialMacros,
      tips: tipsResult.tips,
      healthScore: tipsResult.healthScore,
      swaps: tipsResult.swaps
    });

  } catch (error) {
    console.error('Scan Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during food scan.' });
  }
};

/**
 * Handle confirmation of scanned meals.
 */
export const confirmScan = async (req, res) => {
  try {
    const { meals, category, date, imageUrl, confidenceScore, detectedFoods } = req.body;

    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      return res.status(400).json({ success: false, message: 'No food items specified for log.' });
    }

    const createdEntries = [];

    for (const meal of meals) {
      const { foodId, quantity, servingLabel, customName, customMacros } = meal;

      let foodItem = null;
      let foodName = customName;
      let calculatedMacros = {};

      if (foodId) {
        foodItem = await FoodItem.findById(foodId);
        if (foodItem) {
          foodName = foodItem.name;
          calculatedMacros = servingCalculatorService.calculateNutritionByServing(
            foodItem,
            quantity,
            servingLabel
          );
        }
      }

      // If foodId is missing, or macros are custom-edited in UI
      if (customMacros) {
        calculatedMacros = {
          calories: parseFloat(customMacros.calories) || 0,
          protein: parseFloat(customMacros.protein) || 0,
          carbs: parseFloat(customMacros.carbs) || 0,
          fat: parseFloat(customMacros.fat) || 0,
          fiber: parseFloat(customMacros.fiber) || 0,
          gramsTotal: parseFloat(customMacros.gramsTotal) || 100
        };
      }

      const quantityValue = parseFloat(quantity) || 1;

      // Create FoodEntry in database
      const entry = await FoodEntry.create({
        userId: req.user.id,
        food: foodItem?._id || null,
        foodName: foodName || 'Unknown Food Item',
        servingLabel: servingLabel || '100 g',
        quantity: quantityValue,
        gramsTotal: calculatedMacros.gramsTotal || 100,
        calories: calculatedMacros.calories || 0,
        protein: calculatedMacros.protein || 0,
        carbs: calculatedMacros.carbs || 0,
        fat: calculatedMacros.fat || 0,
        fiber: calculatedMacros.fiber || 0,
        category: category || 'Snacks',
        date: date || new Date(),
        recognition_method: 'ai_scanner',
        cnn_confidence: confidenceScore || 0.85,
        imageUrl,
        aiGenerated: true,
        confidenceScore: confidenceScore || 0.85,
        detectedFoods: detectedFoods || []
      });

      createdEntries.push(entry);
    }

    return res.status(201).json({
      success: true,
      message: `Successfully logged ${createdEntries.length} meal(s) to ${category}!`,
      entries: createdEntries
    });

  } catch (error) {
    console.error('Confirm Scan Controller Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to log scanned meals.' });
  }
};
