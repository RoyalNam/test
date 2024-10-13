import { getReceiverSocketId, io } from '../socket/socket.mjs';
import Message from '../mongoose/schemas/message.mjs';
import UserActivity from '../mongoose/schemas/userActivity.mjs';
import Conversation from '../mongoose/schemas/conversation.mjs';
import Notification from '../mongoose/schemas/notification.mjs';

class MessageController {
    static async getMessages(req, res) {
        try {
            const { id: userToChatId } = req.params;
            const { lastMessageId } = req.query;
            const senderId = req.user._id;

            const messagesPerPage = 15;

            let skip = 0;
            if (lastMessageId) {
                const conversation = await Conversation.findOne({
                    participants: { $all: [senderId, userToChatId] },
                });

                if (!conversation) return res.status(200).json([]);

                const lastMessageIndex = conversation.messages.findIndex(
                    (message) => message.toString() === lastMessageId,
                );
                skip = lastMessageIndex + 1;
            }

            const query = {
                participants: { $all: [senderId, userToChatId] },
            };
            if (lastMessageId) {
                query['messages._id'] = { $ne: lastMessageId };
            }

            const conversation = await Conversation.findOne(query).populate({
                path: 'messages',
                options: {
                    limit: messagesPerPage,
                    sort: { createdAt: -1 },
                    skip: skip,
                },
            });

            if (!conversation) return res.status(200).json([]);

            const messages = conversation.messages;

            res.status(200).json(messages);
        } catch (error) {
            console.log('Error in getMessages controller: ', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async sendMessages(req, res) {
        try {
            const { message } = req.body;
            const { id: receiverId } = req.params;
            const senderId = req.user._id;

            let conversation = await Conversation.findOne({
                participants: { $all: [senderId, receiverId] },
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [senderId, receiverId],
                });
            }

            const newMessage = new Message({
                senderId,
                receiverId,
                message,
            });
            await newMessage.save();

            if (newMessage) {
                conversation.messages.unshift(newMessage._id);
            }
            await conversation.save();

            const newNotification = new Notification({
                user_id: receiverId,
                action: 'messaged',
                content: `New message from ${req.user.name}`,
                sender: senderId,
            });
            await newNotification.save();

            // SOCKET IO FUNCTIONALITY WILL GO HERE
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                // io.to(<socket_id>).emit() used to send events to specific client
                io.to(receiverSocketId).emit('newMessage', newMessage);
                io.to(receiverSocketId).emit('newNotification', newNotification);
            }

            res.status(201).json({ message: newMessage, notification: newNotification });
        } catch (error) {
            console.log('Error in sendMessage controller: ', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getUsersChat(req, res) {
        try {
            const senderId = req.user._id;
            // Find conversations where the senderId is a participant
            const conversations = await Conversation.find({
                participants: senderId,
            });

            if (!conversations || conversations.length === 0) {
                return res.status(200).json([]);
            }

            // Extract participant IDs from all conversations
            let participantIds = [];
            conversations.forEach((conversation) => {
                conversation.participants.forEach((participant) => {
                    // Ensure the participantId is not the senderId (logged-in user)
                    if (String(participant._id) !== String(senderId)) {
                        participantIds.push(participant._id);
                    }
                });
            });

            // Return the unique participant IDs
            res.status(200).json(participantIds);
        } catch (error) {
            console.log('Error in getUsersChat controller: ', error.message);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getUserActivity(req, res) {
        try {
            const { id: userId } = req.params;

            const userActivity = await UserActivity.findOne({ user_id: userId });
            if (!userActivity) {
                return res.status(404).json({ message: 'User activity not found' });
            }
            return res.status(200).json(userActivity);
        } catch (error) {
            console.error('Error retrieving user activity:', error);
            return res.status(500).json({ message: 'An error occurred while retrieving user activity' });
        }
    }
}

export default MessageController;
