import mongoose from 'mongoose';

const foodEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  foodName: { type: String, required: true },
  servingLabel: { type: String, default: '100 g' },
  quantity: { type: Number, default: 1 },
  gramsTotal: { type: Number, default: 100 },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] },
  date: { type: Date, default: Date.now },
  recognition_method: {
    type: String,
    enum: ["manual", "cnn_image", "barcode"],
    default: "manual"
  },
  cnn_confidence: { type: Number }
}, { timestamps: true });

const FoodEntry = mongoose.model('FoodEntry', foodEntrySchema);
export default FoodEntry;
