import mongoose, { Schema } from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        // createdAt, updatedAt
    },
    { timestamps: true },
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
