import { Router } from 'express';
import { getFarms, getFarmById, createFarm, updateFarm, deleteFarm } from '../controllers/farmController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { farmRules, mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getFarms)
  .post(farmRules, validate, createFarm);

router.route('/:id')
  .get(mongoIdParamRule('id'), validate, getFarmById)
  .put(mongoIdParamRule('id'), farmRules, validate, updateFarm)
  .delete(mongoIdParamRule('id'), validate, deleteFarm);

export default router;
