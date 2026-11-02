import { Router } from 'express';
import { getPosts, getPostById, createPost, addComment, deletePost } from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParamRule } from '../validators/entityValidators.js';

const router = Router();

router.get('/', getPosts);
router.get('/:id', mongoIdParamRule('id'), validate, getPostById);

router.post('/', protect, createPost);
router.post('/:id/comment', protect, mongoIdParamRule('id'), validate, addComment);
router.delete('/:id', protect, mongoIdParamRule('id'), validate, deletePost);

export default router;
