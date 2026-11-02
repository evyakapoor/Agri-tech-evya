import { Router } from 'express';
import { getAdminStats, getAllUsers, updateUserRole, deleteUser, moderatePost } from '../controllers/adminController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', mongoIdParamRule('id'), validate, updateUserRole);
router.delete('/users/:id', mongoIdParamRule('id'), validate, deleteUser);
router.put('/posts/:id/moderate', mongoIdParamRule('id'), validate, moderatePost);

export default router;
