import { Router } from 'express';
import { getMyConsultations, getAllConsultations, createConsultation, respondToConsultation } from '../controllers/consultationController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.get('/my', getMyConsultations);
router.post('/', createConsultation);

// Admin / agronomist routes
router.get('/all', requireAdmin, getAllConsultations);
router.put('/:id/respond', requireAdmin, mongoIdParamRule('id'), validate, respondToConsultation);

export default router;
