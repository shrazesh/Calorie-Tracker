import express from 'express';
import auth from '../middleware/auth.js';
import { getDailyReport, getWeeklyReport, getMonthlyReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/daily', auth, getDailyReport);
router.get('/weekly', auth, getWeeklyReport);
router.get('/monthly', auth, getMonthlyReport);

export default router;
