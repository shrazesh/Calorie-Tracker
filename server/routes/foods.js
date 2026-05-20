import express from 'express';
import auth from '../middleware/auth.js';
import { searchFoods, getFoodById } from '../controllers/foodsController.js';

const router = express.Router();

router.get('/', auth, searchFoods);
router.get('/:id', auth, getFoodById);

export default router;
