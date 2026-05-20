import express from 'express';
import auth from '../middleware/auth.js';
import { addFood, getAllFood, updateFood, deleteFood } from '../controllers/foodController.js';

const router = express.Router();

router.post('/add', auth, addFood);
router.post('/', auth, addFood);
router.get('/all', auth, getAllFood);
router.get('/', auth, getAllFood);
router.put('/update/:id', auth, updateFood);
router.delete('/delete/:id', auth, deleteFood);

export default router;
