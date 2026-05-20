import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { calcTargets } from '../utils/calcTargets.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  calorieGoal: { type: Number, default: 2000 },
  age: { type: Number },
  weight: { type: Number },
  height: { type: Number },
  activityLevel: { type: String, default: 'moderate' },
  gender: { type: String, default: 'male' },
  goal: { type: String, enum: ['weight_loss', 'weight_gain', 'maintain'], default: 'maintain' },
  profileComplete: { type: Boolean, default: false },
  bmr: { type: Number },
  tdee: { type: Number },
  dailyCalorieGoal: { type: Number },
  macroTargets: {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 150 },
    carbs: { type: Number, default: 200 },
    fat: { type: Number, default: 67 }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  // Sync macro targets with calorie goal
  const calorieGoal = this.dailyCalorieGoal || this.calorieGoal || 2000;
  this.macroTargets = calcTargets(calorieGoal);

  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
