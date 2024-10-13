import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
    {
        email: { type: String, unique: true, required: true },
        name: { type: String, required: true },
        avatar: { type: String },
        account: {
            type: {
                type: String,
                enum: ['facebook', 'google'],
            },
            account_id: { type: String },
        },
        password: { type: String },
        bio: { type: String },
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
        save_post: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    },
    { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
