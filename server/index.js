import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import foodRoutes from './routes/food.js';
import reportRoutes from './routes/report.js';
import recommendationRoutes from './routes/recommendation.js';
import foodRecognitionRoutes from './routes/foodRecognitionRoutes.js';
import foodsRoutes from './routes/foods.js';
import recommendRoutes from './routes/recommend.js';
import nutritionRoutes from './routes/nutrition.js';

dotenv.config();
console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'YES' : 'NO');

const app = express();
app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/foodlog', foodRoutes);
app.use('/api/foods', foodsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/food-recognition', foodRecognitionRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/nutrition', nutritionRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI;

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to Persistent MongoDB');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
}

startServer();
