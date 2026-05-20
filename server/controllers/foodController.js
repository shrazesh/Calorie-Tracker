import FoodEntry from '../models/FoodEntry.js';
import FoodItem from '../models/FoodItem.js';

export const addFoodValidation = []; // Dummy validation array to match route

export const addFood = async (req, res) => {
  try {
    const { foodId, foodName, servingLabel, quantity, category, date } = req.body;
    
    let foodItem = null;
    if (foodId) {
      foodItem = await FoodItem.findById(foodId);
    } else if (foodName) {
      foodItem = await FoodItem.findOne({ name: { $regex: `^${foodName}$`, $options: 'i' } });
    }

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const qty = Number(quantity || 1);
    const label = servingLabel || '100 g';

    // Find selected serving by label
    let serving = foodItem.servings?.find(s => s.label.toLowerCase() === label.toLowerCase());
    
    // Fallback: If not found, use default 100g
    if (!serving) {
      serving = { label: '100 g', grams: 100 };
    }

    const gramsTotal = Math.round((serving.grams * qty) * 10) / 10;
    const factor = gramsTotal / 100;

    // Retrieve nutrients per 100g from either nutrientsPer100g nested object or direct keys
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
      foodName: foodItem.name,
      servingLabel: label,
      quantity: qty,
      gramsTotal,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      category: category || 'Snacks',
      date: date || new Date(),
      recognition_method: req.body.recognition_method || 'manual'
    });

    res.status(201).json({ entry });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Error adding entry' }); 
  }
};

export const getAllFood = async (req, res) => {
  try {
    const { filter } = req.query;
    let dateQuery = {};
    const now = new Date();
    
    if (filter === 'daily') {
      const start = new Date(now.setHours(0,0,0,0));
      const end = new Date(now.setHours(23,59,59,999));
      dateQuery = { date: { $gte: start, $lte: end } };
    } else if (filter === 'weekly') {
      const start = new Date(now); start.setDate(start.getDate() - 7);
      dateQuery = { date: { $gte: start, $lte: new Date() } };
    }
    
    const entries = await FoodEntry.find({ userId: req.user.id, ...dateQuery }).sort({ date: -1 });
    res.json({ entries });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const updateFood = async (req, res) => {
  try {
    const { foodId, foodName, servingLabel, quantity, category, date } = req.body;
    
    let foodItem = null;
    if (foodId) {
      foodItem = await FoodItem.findById(foodId);
    } else if (foodName) {
      foodItem = await FoodItem.findOne({ name: { $regex: `^${foodName}$`, $options: 'i' } });
    }

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const qty = Number(quantity || 1);
    const label = servingLabel || '100 g';

    // Find selected serving by label
    let serving = foodItem.servings?.find(s => s.label.toLowerCase() === label.toLowerCase());
    
    // Fallback: If not found, use default 100g
    if (!serving) {
      serving = { label: '100 g', grams: 100 };
    }

    const gramsTotal = Math.round((serving.grams * qty) * 10) / 10;
    const factor = gramsTotal / 100;

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

    const entry = await FoodEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        food: foodItem._id,
        foodName: foodItem.name,
        servingLabel: label,
        quantity: qty,
        gramsTotal,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        category: category || 'Snacks',
        date: date || new Date(),
        recognition_method: req.body.recognition_method || 'manual'
      },
      { new: true }
    );

    res.json({ entry });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Error updating entry' }); 
  }
};

export const deleteFood = async (req, res) => {
  try {
    await FoodEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};
