/**
 * Purpose: Map AI detected labels to database USDA/local food items.
 * Inputs: AI detected labels (e.g. "sandwich", "bowl", "cup", "donut").
 * Outputs: List of candidate FoodItem documents from MongoDB.
 */

import FoodItem from '../models/FoodItem.js';
import fuzzysort from 'fuzzysort';

class NutritionMatcherService {
  /**
   * Get custom category mappings from YOLOv8 COCO classes to database food labels.
   */
  getLabelMapping(detectedLabel) {
    const label = detectedLabel.toLowerCase().trim();

    // Expanded mappings for better fallback
    const mappings = {
      'sandwich': ['burger', 'hamburger', 'sandwich', 'choila'],
      'burger': ['burger', 'hamburger', 'cheeseburger'],
      'cheeseburger': ['burger', 'hamburger', 'cheeseburger'],
      'hamburger': ['burger', 'hamburger', 'cheeseburger'],
      'donut': ['sel_roti', 'donut', 'bara'],
      'bagel': ['sel_roti', 'donut', 'bread'],
      'onion ring': ['sel_roti', 'snack'],
      'cup': ['chiya', 'tea', 'water', 'soda', 'protein_powder', 'milk'],
      'bowl': ['dal_bhat', 'ramen', 'salad', 'momo', 'lentil_soup', 'rice', 'kheer', 'dhido', 'chowmein'],
      'pizza': ['pizza'],
      'cheese pizza': ['pizza'],
      'pepperoni pizza': ['pizza'],
      'margherita pizza': ['pizza'],
      'bread': ['bread', 'sel_roti'],
      'apple': ['apple', 'avocado'],
      'peach': ['apple', 'fruit'],
      'tomato': ['salad', 'vegetables'],
      'plum': ['apple', 'fruit'],
      'banana': ['banana'],
      'orange': ['orange', 'fruit'],
      'broccoli': ['broccoli', 'salad', 'spinach'],
      'carrot': ['salad', 'vegetables'],
      'mixed vegetables': ['salad', 'vegetables'],
      'lettuce': ['salad', 'vegetables'],
      'cake': ['yomari', 'cake', 'brownie', 'kheer'],
      'hot dog': ['burger', 'sausage'],
      'steak': ['steak', 'choila'],
      'salmon': ['salmon', 'fish'],
      'momo': ['momo', 'chicken_momo', 'buff_momo'],
      'chicken momo': ['momo', 'chicken_momo'],
      'buff momo': ['momo', 'buff_momo'],
      'veg momo': ['momo', 'veg_momo'],
      'dumplings': ['momo'],
      'bao': ['momo'],
      'dal_bhat': ['dal_bhat', 'dal_bhat_tarkari', 'thakali'],
      'dal bhat': ['dal_bhat', 'dal_bhat_tarkari', 'thakali'],
      'thakali set': ['thakali', 'thakali_set', 'dal_bhat'],
      'rice and curry': ['dal_bhat'],
      'lentil soup': ['dal_bhat'],
      'sel_roti': ['sel_roti'],
      'sel roti': ['sel_roti'],
      'chiya': ['chiya', 'tea'],
      'chowmein': ['chowmein'],
      'thakali': ['thakali', 'thakali_set'],
      'choila': ['choila'],
      'yomari': ['yomari'],
      'dhido': ['dhido'],
      'ramen': ['ramen'],
      'salad': ['salad', 'broccoli', 'spinach'],
      'protein shake': ['protein_powder', 'milk']
    };

    return mappings[label] || [label];
  }

  /**
   * Matches a detected label against the FoodItem collection in MongoDB using fuzzy matching.
   * @param {string} detectedLabel - The label from the AI service
   * @returns {Promise<Array>} List of matching FoodItem documents
   */
  async matchFoodToDb(detectedLabel) {
    try {
      const searchTerms = this.getLabelMapping(detectedLabel);
      
      // Fetch all foods or a cached list (in a real production app, cache this in Redis or memory)
      // For now, we query all or a large subset since our DB is small
      const allFoods = await FoodItem.find({});
      
      let topMatches = [];
      
      // We will perform a fuzzy search in the database for items that match the terms
      for (const term of searchTerms) {
          const cleanTerm = term.replace('_', ' ');
          
          // Use fuzzysort to rank matches by name or cnn_label
          const results = fuzzysort.go(cleanTerm, allFoods, {
              keys: ['name', 'cnn_label', 'display_name'],
              threshold: -10000, // lower means more strict
              limit: 10
          });
          
          for (const res of results) {
              // Add only if not already in list
              if (!topMatches.find(item => item._id.toString() === res.obj._id.toString())) {
                  topMatches.push(res.obj);
              }
          }
      }
      
      // If we got nothing from fuzzysort (unlikely), fallback to old method
      if (topMatches.length === 0) {
        const cleanTerm = detectedLabel.replace('_', ' ');
        topMatches = await FoodItem.find({
          $or: [
            { name: { $regex: cleanTerm, $options: 'i' } },
            { cnn_label: { $regex: cleanTerm, $options: 'i' } }
          ]
        }).limit(6);
      }

      // If still nothing, return a default set of popular foods so the system never breaks
      if (topMatches.length === 0) {
        topMatches = await FoodItem.find({}).limit(5);
      }

      return topMatches.slice(0, 10);
    } catch (error) {
      console.error(`Error matching food label "${detectedLabel}":`, error);
      return [];
    }
  }
}

export default new NutritionMatcherService();
