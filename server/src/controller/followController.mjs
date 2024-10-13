import { User, Notification } from '../mongoose/schemas/index.js';
import { getReceiverSocketId, io } from '../socket/socket.mjs';

class FollowController {
    static async addFollower(req, res) {
        const { userId, followerId } = req.params;
        try {
            const user = await User.findById(userId);
            const follower = await User.findById(followerId);

            if (!user || !follower) {
                return res.status(404).json({ message: 'User or follower not found' });
            }

            if (user.followers.includes(follower._id)) {
                return res.status(400).json({ message: 'Follower already exists' });
            }

            user.followers.push(follower._id);
            follower.following.push(user._id);
            await user.save();
            await follower.save();
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
    static async removeFollower(req, res) {
        const { userId, followerId } = req.params;
        try {
            const user = await User.findById(userId);
            const follower = await User.findById(followerId);

            if (!user || !follower) {
                return res.status(404).json({ message: 'User or follower not found' });
            }

            if (!user.followers.includes(follower._id)) {
                return res.status(400).json({ message: 'Follower does not exist' });
            }

            user.followers = user.followers.filter((id) => id.toString() !== follower._id.toString());
            follower.following = follower.following.filter((id) => id.toString() !== user._id.toString());
            await user.save();
            await follower.save();
            res.status(200).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    static async followUser(req, res) {
        const { userId, followingId } = req.params;
        try {
            const user = await User.findById(userId);
            const followingUser = await User.findById(followingId);

            if (!user || !followingUser) {
                return res.status(404).json({ message: 'User or following user not found' });
            }
            const isFollowing = user.following.includes(followingUser._id);
            if (isFollowing) {
                return res.status(400).json({ message: 'User already follows this user', isFollowing });
            }

            user.following.push(followingUser._id);
            followingUser.followers.push(user._id);
            await Promise.all([user.save(), followingUser.save()]);

            const newNotification = new Notification({
                user_id: followingUser._id,
                action: 'followed',
                content: `${user.name} followed you`,
                sender: user._id,
            });
            await newNotification.save();

            const receiverSocketId = getReceiverSocketId(followingUser._id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', newNotification);
            }

            // Send response
            res.status(200).json({ isFollowing: true, notification: newNotification });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    static async unFollowUser(req, res) {
        const { userId, followingId } = req.params;
        try {
            const user = await User.findById(userId);
            const followingUser = await User.findById(followingId);

            if (!user || !followingUser) {
                return res.status(404).json({ message: 'User or following user not found' });
            }
            const isFollowing = user.following.includes(followingUser._id);

            if (!isFollowing) {
                return res.status(400).json({ message: 'User does not follow this user', isFollowing });
            }

            user.following = user.following.filter((id) => id.toString() !== followingUser._id.toString());
            followingUser.followers = followingUser.followers.filter((id) => id.toString() !== user._id.toString());
            await user.save();
            await followingUser.save();
            res.status(200).json({ isFollowing: !isFollowing });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    static async getFollowers(req, res) {
        const { userId } = req.params;
        try {
            const user = await User.findById(userId).populate('followers', 'name email avatar');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user.followers);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    static async getFollowing(req, res) {
        const { userId } = req.params;
        try {
            const user = await User.findById(userId).populate('following', 'name email avatar');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user.following);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
}

export default FollowController;
