import express from 'express';
import PostController from '../controller/postController.mjs';
import { authenticateToken } from '../utils/authMiddleware.mjs';

const router = express.Router();

router.post('/api/posts', authenticateToken, PostController.createPost);
router.put('/api/posts/:postId', authenticateToken, PostController.updatePost);
router.get('/api/:userId/posts/:postId', PostController.getPostByUser);
router.delete('/api/posts/:postId', authenticateToken, PostController.deletePost);
router.post('/api/posts/save', authenticateToken, PostController.savePost);
router.get('/api/posts/', PostController.getRandomPosts);
router.post('/api/:userId/posts/:postId/like', authenticateToken, PostController.likePost);

export default router;
