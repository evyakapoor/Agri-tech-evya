import { Router } from 'express';
import { getPestAlerts, createPestAlert, updatePestAlert, deletePestAlert } from '../controllers/pestController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getPestAlerts)
  .post(createPestAlert);

router.route('/:id')
  .put(mongoIdParamRule('id'), validate, updatePestAlert)
  .delete(mongoIdParamRule('id'), validate, deletePestAlert);

export default router;
