import { Router } from 'express';
import { getResources, getResourceById, createResource, updateResource, deleteResource } from '../controllers/resourceController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

// Publicly browseable or authenticated
router.get('/', getResources);
router.get('/:id', mongoIdParamRule('id'), validate, getResourceById);

// Admin-managed resource CRUD
router.post('/', protect, requireAdmin, createResource);
router.put('/:id', protect, requireAdmin, mongoIdParamRule('id'), validate, updateResource);
router.delete('/:id', protect, requireAdmin, mongoIdParamRule('id'), validate, deleteResource);

export default router;
