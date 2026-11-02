import { Router } from 'express';
import { getActivities, createActivity, deleteActivity } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.get('/', getActivities);
router.post('/', createActivity);
router.delete('/:id', mongoIdParamRule('id'), validate, deleteActivity);

export default router;
