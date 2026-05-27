/**
 * Purpose: Map AI detected labels to database USDA/local food items.
 * Inputs: AI detected labels (e.g. "sandwich", "bowl", "cup", "donut").
 * Outputs: List of candidate FoodItem documents from MongoDB.
 */

import FoodItem from '../models/FoodItem.js';

class NutritionMatcherService {
  /**
   * Get custom category mappings from YOLOv8 COCO classes to database food labels.
   */
  getLabelMapping(detectedLabel) {
    const label = detectedLabel.toLowerCase().trim();

    // Map common COCO class names to search terms or cnn_labels
    const mappings = {
      'sandwich': ['burger', 'hamburger', 'sandwich', 'choila'],
      'burger': ['burger', 'hamburger', 'cheeseburger'],
      'donut': ['sel_roti', 'donut', 'bara'],
      'cup': ['chiya', 'tea', 'water', 'soda', 'protein_powder', 'milk'],
      'bowl': ['dal_bhat', 'ramen', 'salad', 'momo', 'lentil_soup', 'rice', 'kheer', 'dhido', 'chowmein'],
      'pizza': ['pizza'],
      'apple': ['apple', 'avocado'],
      'banana': ['banana'],
      'orange': ['orange', 'fruit'],
      'broccoli': ['broccoli', 'salad', 'spinach'],
      'carrot': ['salad', 'vegetables'],
      'cake': ['yomari', 'cake', 'brownie', 'kheer'],
      'hot dog': ['burger', 'sausage'],
      'steak': ['steak', 'choila'],
      'salmon': ['salmon', 'fish'],
      'momo': ['momo', 'chicken_momo', 'buff_momo'],
      'dal_bhat': ['dal_bhat', 'dal_bhat_tarkari', 'thakali'],
      'sel_roti': ['sel_roti'],
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
   * Matches a detected label against the FoodItem collection in MongoDB.
   * @param {string} detectedLabel - The label from the AI service
   * @returns {Promise<Array>} List of matching FoodItem documents
   */
  async matchFoodToDb(detectedLabel) {
    try {
      const searchTerms = this.getLabelMapping(detectedLabel);
      
      // We will perform a search in the database for items that match either the cnn_label or the name.
      // We search for exact cnn_label matches first, then fallback to regex search.
      const queryConditions = [
        { cnn_label: { $in: searchTerms } },
        { name: { $in: searchTerms.map(term => new RegExp(term.replace('_', ' '), 'i')) } }
      ];

      // Combine conditions using $or
      let matchedFoods = await FoodItem.find({ $or: queryConditions }).limit(10);

      // If no foods match the custom term mapping, do a generic regex search
      if (matchedFoods.length === 0) {
        const cleanTerm = detectedLabel.replace('_', ' ');
        matchedFoods = await FoodItem.find({
          $or: [
            { name: { $regex: cleanTerm, $options: 'i' } },
            { cnn_label: { $regex: cleanTerm, $options: 'i' } }
          ]
        }).limit(6);
      }

      // If still nothing, return a default set of popular foods so the system never breaks
      if (matchedFoods.length === 0) {
        matchedFoods = await FoodItem.find({}).limit(5);
      }

      return matchedFoods;
    } catch (error) {
      console.error(`Error matching food label "${detectedLabel}":`, error);
      return [];
    }
  }
}

export default new NutritionMatcherService();
