import { Post, Notification, User } from '../mongoose/schemas/index.js';
import { getReceiverSocketId, io } from '../socket/socket.mjs';

const handleNotFound = (res, item) => {
    return res.status(404).json({ message: `${item} not found` });
};

class CommentController {
    static async addComment(req, res) {
        try {
            const { postId } = req.params;
            const { comment_text } = req.body;

            const currentUser = req.user;
            if (!currentUser || !currentUser._id) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const post = await Post.findOneAndUpdate(
                { _id: postId },
                { $push: { comments: { user_id: currentUser._id, comment_text } } },
                { new: true },
            );

            if (!post) return handleNotFound(res, 'Post');

            const newComment = post.comments[0];
            const newNotification = new Notification({
                user_id: post.user_id,
                action: 'commented',
                content: `New comment by ${currentUser.name} on your post`,
                sender: currentUser._id,
            });

            await newNotification.save();

            const receiverSocketId = getReceiverSocketId(post.user_id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', newNotification);
            }

            res.status(201).json({
                message: 'Comment added successfully',
                comment: newComment,
                notification: newNotification,
            });
        } catch (error) {
            console.error('Error creating comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async updateComment(req, res) {
        try {
            const { postId, commentId } = req.params;
            const { comment_text } = req.body;

            const currentUser = req.user;
            const post = await Post.findOneAndUpdate(
                { _id: postId, 'comments._id': commentId },
                { $set: { 'comments.$.comment_text': comment_text } },
                { new: true },
            );
            if (!post) return handleNotFound(res, 'Post or Comment');

            const updatedComment = post.comments.find((comment) => comment._id.toString() === commentId);
            res.status(200).json({ message: 'Comment updated successfully', comment: updatedComment });
        } catch (error) {
            console.error('Error updating comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async deleteComment(req, res) {
        try {
            const { postId, commentId } = req.params;

            const post = await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { comments: { _id: commentId } } },
                { new: true },
            );
            if (!post) return handleNotFound(res, 'Post or Comment');

            res.status(200).json({ message: 'Comment deleted successfully' });
        } catch (error) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    static async addReply(req, res) {
        try {
            const { postId, commentId } = req.params;
            const { parentId, comment_text } = req.body;

            const currentUser = req.user;
            const post = await Post.findOne({ _id: postId, 'comments._id': commentId });
            if (!post) return handleNotFound(res, 'Post or Comment');

            const targetComment = post.comments.find((comment) => comment._id.toString() === commentId);
            if (!targetComment) return handleNotFound(res, 'Comment');

            let newReply, newNotification;

            // Handle parent reply
            if (parentId) {
                const findParentReply = (replies) => {
                    for (const reply of replies) {
                        if (reply._id.toString() === parentId) return reply;
                        if (reply.replies && reply.replies.length > 0) {
                            const parentReply = findParentReply(reply.replies);
                            if (parentReply) return parentReply;
                        }
                    }
                    return null;
                };
                const parentReplyToUpdate = findParentReply(targetComment.replies);
                if (!parentReplyToUpdate) return handleNotFound(res, 'Parent reply');

                parentReplyToUpdate.replies.push({ user_id: currentUser._id, comment_text });
                newReply = parentReplyToUpdate.replies.slice(-1)[0];

                newNotification = new Notification({
                    user_id: parentReplyToUpdate.user_id._id,
                    action: 'replied',
                    content: `New reply by ${currentUser.name}`,
                    sender: currentUser._id,
                });
            } else {
                targetComment.replies.push({ user_id: currentUser._id, comment_text });
                newReply = targetComment.replies.slice(-1)[0];

                newNotification = new Notification({
                    user_id: targetComment.user_id._id,
                    action: 'replied',
                    content: `New reply by ${currentUser.name}`,
                    sender: currentUser._id,
                });
            }

            await newNotification.save();
            await post.save();

            const receiverSocketId = getReceiverSocketId(newNotification.user_id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('newNotification', newNotification);
            } else {
                console.warn(`Socket ID not found for user ID: ${newNotification.user_id}`);
            }

            res.status(201).json({
                message: parentId ? 'Nested reply added successfully' : 'Reply added successfully',
                reply: newReply,
                notification: newNotification,
            });
        } catch (error) {
            console.error('Error adding reply:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export default CommentController;
