import { Router } from 'express';
import { getCrops, getCropById, createCrop, updateCrop, deleteCrop } from '../controllers/cropController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cropRules, mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(cropRules, validate, createCrop);

router.route('/:id')
  .get(mongoIdParamRule('id'), validate, getCropById)
  .put(mongoIdParamRule('id'), validate, updateCrop)
  .delete(mongoIdParamRule('id'), validate, deleteCrop);

export default router;
