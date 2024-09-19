import { User } from '../mongoose/schemas/user.mjs';
import { getReceiverSocketId, io } from '../socket/socket.mjs';
import Notification from '../mongoose/schemas/notification.mjs';

class PostController {
    static async createPost(req, res) {
        try {
            const { image_url, caption } = req.body;
            const currentUser = req.user;

            const newPost = {
                image_url,
                caption,
                user: currentUser._id,
            };

            currentUser.posts.unshift(newPost);

            await currentUser.save();

            res.status(201).json({ message: 'Post created successfully', post: currentUser.posts[0] });
        } catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updatePost(req, res) {
        try {
            const postId = req.params.postId;
            const { image_url, caption } = req.body;

            const currentUser = req.user;
            const post = currentUser.posts.find((post) => post._id == postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            post.image_url = image_url || post.image_url;
            post.caption = caption || post.caption;

            await currentUser.save();

            res.status(200).json({ message: 'Post updated successfully', post });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deletePost(req, res) {
        try {
            const postId = req.params.postId;

            const currentUser = req.user;
            const postIndex = currentUser.posts.findIndex((post) => post._id == postId);

            if (postIndex === -1) {
                return res.status(404).json({ message: 'Post not found' });
            }

            currentUser.posts.splice(postIndex, 1);

            await currentUser.save();

            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPostByUser(req, res) {
        try {
            const { userId, postId } = req.params;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const post = user.posts.find((post) => post._id.toString() === postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.status(200).json({ message: 'Post retrieved successfully', post });
        } catch (error) {
            console.error('Error retrieving user post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getRandomPosts(req, res) {
        try {
            let numberOfPostsToShow = 15;

            if (req.body && req.body.numberOfPostsToShow) {
                numberOfPostsToShow = req.body.numberOfPostsToShow;
            }

            req.previousPostIds = req.previousPostIds || [];

            if (!req.totalPosts) {
                req.totalPosts = await User.aggregate([
                    { $project: { totalPosts: { $size: '$posts' } } },
                    { $group: { _id: null, total: { $sum: '$totalPosts' } } },
                ]);
            }
            if (req.previousPostIds.length >= req.totalPosts.total) {
                return res.status(400).json({ message: 'All posts already retrieved' });
            }

            const posts = await User.aggregate([
                { $unwind: '$posts' },
                { $match: { 'posts._id': { $nin: req.previousPostIds } } },
                { $sample: { size: numberOfPostsToShow } },
                {
                    $project: {
                        _id: '$posts._id',
                        author: {
                            _id: '$_id',
                            name: '$name',
                            avatar: '$avatar',
                        },
                        post: '$posts',
                    },
                },
            ]);

            const newPostIds = posts.map((post) => post.post._id);
            req.previousPostIds = [...req.previousPostIds, ...newPostIds];

            res.status(200).json({ message: 'Random posts retrieved successfully', posts });
        } catch (error) {
            console.error('Error retrieving random posts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    static async likePost(req, res) {
        try {
            const { userId, postId } = req.params;
            const currentUser = req.user;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const post = user.posts.find((post) => post._id.toString() === postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const isLiked = post.likes.includes(currentUser._id);

            if (isLiked) {
                post.likes = post.likes.filter((like) => like.toString() !== currentUser._id.toString());

                await Notification.deleteOne({ user: userId, sender: currentUser._id, action: 'liked' });
            } else {
                post.likes.push(currentUser._id);

                const newNotification = new Notification({
                    user: userId,
                    action: 'liked',
                    content: `${currentUser.name} liked your post`,
                    sender: currentUser._id,
                });
                await newNotification.save();

                const ownerSocketId = getReceiverSocketId(userId);
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newNotification', newNotification);
                }
            }

            await user.save();

            res.status(200).json({
                message: !isLiked ? 'Post has been liked' : 'Post has not been liked',
                isLiked: !isLiked,
            });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async savePost(req, res) {
        try {
            const { userId, postId } = req.body;
            const currentUser = req.user;

            const index = currentUser.save_post.findIndex(
                (item) => item.user_id.toString() === userId && item.post_id.toString() === postId,
            );
            if (index !== -1) {
                currentUser.save_post.splice(index, 1);
                await currentUser.save();
                res.status(200).json({ message: 'Post removed from saved list', postId: postId, saved: false });
            } else {
                const newPostToSave = {
                    user_id: userId,
                    post_id: postId,
                };
                currentUser.save_post.push(newPostToSave);
                await currentUser.save();
                res.status(200).json({ message: 'Post saved successfully', post: newPostToSave, saved: true });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default PostController;
