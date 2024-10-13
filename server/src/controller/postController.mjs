import { getReceiverSocketId, io } from '../socket/socket.mjs';
import { Notification, Post, User } from '../mongoose/schemas/index.js';

class PostController {
    static async createPost(req, res) {
        try {
            const { image_url, caption } = req.body;
            const currentUser = req.user;

            const newPost = new Post({
                image_url,
                caption,
                user_id: currentUser._id,
            });

            const savedPost = await newPost.save();
            currentUser.posts.push(savedPost._id);

            await currentUser.save();

            res.status(201).json(savedPost);
        } catch (error) {
            res.status(500).json({ error: 'Error creating post' });
        }
    }

    static async updatePost(req, res) {
        try {
            const postId = req.params.postId;
            const { image_url, caption } = req.body;

            const post = await Post.findById(postId);

            if (!post || post.user_id.toString() !== req.user._id.toString()) {
                return res.status(404).json({ message: 'Post not found or unauthorized' });
            }

            post.image_url = image_url || post.image_url;
            post.caption = caption || post.caption;
            post.updatedAt = new Date();

            const updatedPost = await post.save();

            res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
        } catch (error) {
            console.error('Error updating post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deletePost(req, res) {
        try {
            const postId = req.params.postId;

            const currentUser = req.user;
            const post = await Post.findById(postId);

            if (!post || post.user_id.toString() !== currentUser._id.toString()) {
                return res.status(404).json({ message: 'Post not found or unauthorized' });
            }

            currentUser.posts = currentUser.posts.filter((p) => p.toString() !== postId);
            await currentUser.save();

            await Post.deleteOne({ _id: postId });

            res.status(200).json({ message: 'Post deleted successfully' });
        } catch (error) {
            console.error('Error deleting post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async GetPostById(req, res) {
        try {
            const postId = req.params.postId;

            const post = await Post.findById(postId);

            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            res.status(200).json(post);
        } catch (error) {
            console.error('Error retrieving post:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async getPostByUser(req, res) {
        try {
            const { userId, postId } = req.params;

            const post = await Post.findById(postId).populate('user', 'name avatar');
            if (!post || post.user_id._id.toString() !== userId) {
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
            const numberOfPostsToShow = req.query.previousPostIds ? req.query.numberOfPostsToShow : 15;
            const previousPostIds = req.query.previousPostIds ? req.query.previousPostIds.split(',') : [];

            const totalPosts = await Post.countDocuments();

            if (previousPostIds.length >= totalPosts) {
                return res.status(400).json({ message: 'All posts already retrieved' });
            }
            const randomPosts = await Post.aggregate([
                { $match: { _id: { $nin: previousPostIds } } },
                { $sample: { size: numberOfPostsToShow } },
            ]);

            return res.status(200).json(randomPosts);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async likePost(req, res) {
        try {
            const { postId } = req.params;
            const currentUser = req.user;

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            const isLiked = post.likes.includes(currentUser._id);

            if (isLiked) {
                post.likes = post.likes.filter((like) => like.toString() !== currentUser._id.toString());
                await Notification.deleteOne({
                    user_id: post.user_id,
                    sender: currentUser._id,
                    action: 'liked',
                });
                await post.save();
                return res.status(200).json({
                    message: 'Post has not been liked',
                    isLiked: false,
                });
            } else {
                post.likes.push(currentUser._id);

                const newNotification = new Notification({
                    user_id: post.user_id,
                    action: 'liked',
                    content: `${currentUser.name} liked your post`,
                    sender: currentUser._id,
                });
                await newNotification.save();

                const ownerSocketId = getReceiverSocketId(post.user_id);
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newNotification', newNotification);
                }

                await post.save();

                return res.status(200).json({
                    message: 'Post has been liked',
                    isLiked: true,
                });
            }
        } catch (error) {
            console.error('Error updating post:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async savePost(req, res) {
        try {
            const { postId } = req.body;
            const currentUser = req.user;

            if (!Array.isArray(currentUser.save_post)) {
                currentUser.save_post = [];
            }

            const alreadySavedIndex = currentUser.save_post.findIndex((item) => item.toString() === postId);

            if (alreadySavedIndex !== -1) {
                currentUser.save_post.splice(alreadySavedIndex, 1);
                await currentUser.save();
                return res.status(200).json({ message: 'Post removed from saved list', postId, saved: false });
            } else {
                currentUser.save_post.push(postId);
                await currentUser.save();
                return res.status(200).json({
                    message: 'Post saved successfully',
                    post: { user_id: currentUser._id, post_id: postId },
                    saved: true,
                });
            }
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default PostController;
