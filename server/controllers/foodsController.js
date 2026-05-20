import FoodItem from '../models/FoodItem.js';

/**
 * GET /api/foods?search=keyword
 * Returns a list of foods matching the search keyword (name and _id only).
 */
export const searchFoods = async (req, res) => {
  try {
    const { search, q, category } = req.query;
    const searchKeyword = search || q;
    
    let query = {};
    if (searchKeyword && searchKeyword.trim() !== '') {
      query.name = { $regex: searchKeyword, $options: 'i' };
    }

    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      let keywords = [];
      const cat = category.toLowerCase().trim();

      if (cat === 'nepali foods') {
        keywords = ['momo', 'dal bhat', 'sel roti', 'gundruk', 'dhido', 'thakali', 'chiura', 'yomari', 'choila', 'bara'];
      } else if (cat === 'meals') {
        keywords = ['pizza', 'burger', 'biryani', 'chowmein', 'ramen', 'pasta', 'tacos', 'sushi', 'steak', 'fish and chips'];
      } else if (cat === 'ingredients') {
        keywords = ['spinach', 'broccoli', 'olive oil', 'tofu', 'sweet potato'];
      } else if (cat === 'fruits & veg' || cat === 'fruits and veg') {
        keywords = ['banana', 'apple', 'blueberries', 'avocado'];
      } else if (cat === 'snacks') {
        keywords = ['almonds', 'peanut butter', 'chocolate', 'chips', 'hummus'];
      } else if (cat === 'drinks') {
        keywords = ['tea', 'chiya', 'soda', 'water'];
      } else if (cat === 'protein') {
        keywords = ['chicken', 'tuna', 'egg', 'whey protein', 'salmon', 'steak'];
      } else if (cat === 'grains') {
        keywords = ['rice', 'oatmeal', 'quinoa', 'bread'];
      } else if (cat === 'dairy') {
        keywords = ['yogurt', 'cottage cheese'];
      }

      if (keywords.length > 0) {
        if (query.name) {
          query = {
            $and: [
              { name: query.name },
              { name: { $regex: keywords.join('|'), $options: 'i' } }
            ]
          };
        } else {
          query.name = { $regex: keywords.join('|'), $options: 'i' };
        }
      }
    }

    // Return list of foods with name, nutrientsPer100g, and servings from MongoDB
    const foods = await FoodItem.find(query)
      .select('name _id calories_per_100g protein_g carbs_g fats_g fiber_g nutrientsPer100g servings display_name cnn_label')
      .sort({ name: 1 });

    res.status(200).json(foods);
  } catch (error) {
    console.error('Error searching foods:', error);
    res.status(500).json({ message: 'Server error searching foods' });
  }
};

/**
 * GET /api/foods/:id
 * Returns full details (including macros) of the selected food item.
 */
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await FoodItem.findById(id);
    
    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.status(200).json(food);
  } catch (error) {
    console.error('Error getting food by ID:', error);
    res.status(500).json({ message: 'Server error getting food details' });
  }
};
