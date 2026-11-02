import { Router } from 'express';
import { getWeather, getWeatherHistory } from '../controllers/weatherController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Allow optional protect so dashboard can query weather with or without specific farm
router.get('/', protect, getWeather);
router.get('/history', protect, getWeatherHistory);

export default router;
