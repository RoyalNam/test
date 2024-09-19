import { Router } from 'express';
import FollowController from '../controller/followController.mjs';

const router = Router();

router.post('/api/:userId/followers/:followerId', FollowController.addFollower);
router.delete('/api/:userId/followers/:followerId', FollowController.removeFollower);
router.post('/api/:userId/following/:followingId', FollowController.followUser);
router.delete('/api/:userId/following/:followingId', FollowController.unFollowUser);
router.get('/api/:userId/followers', FollowController.getFollowers);
router.get('/api/:userId/following', FollowController.getFollowing);

export default router;
