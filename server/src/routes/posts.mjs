import express from 'express';
import PostController from '../controller/postController.mjs';
import { authenticateToken } from '../utils/authMiddleware.mjs';

const router = express.Router();

router.post('/api/posts', authenticateToken, PostController.createPost);
router.get('/api/posts/:postId', PostController.GetPostById);
router.put('/api/posts/:postId', authenticateToken, PostController.updatePost);
router.delete('/api/posts/:postId', authenticateToken, PostController.deletePost);
router.get('/api/:userId/posts/:postId', PostController.getPostByUser);
router.post('/api/posts/save', authenticateToken, PostController.savePost);
router.get('/api/posts/', PostController.getRandomPosts);
router.post('/api/posts/:postId/like', authenticateToken, PostController.likePost);

export default router;
