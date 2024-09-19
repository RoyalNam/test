import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    content: { type: String },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
