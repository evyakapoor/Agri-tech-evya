import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/all', requireAdmin, getAllOrders);
router.get('/:id', mongoIdParamRule('id'), validate, getOrderById);
router.put('/:id/status', requireAdmin, mongoIdParamRule('id'), validate, updateOrderStatus);

export default router;
