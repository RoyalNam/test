import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema({
    _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    comment_text: { type: String },
    comment_date: { type: Date, default: Date.now },
});
commentSchema.add({
    replies: [commentSchema],
});

const userSchema = new Schema({
    email: { type: String, unique: true },
    name: { type: String },
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
    join_date: { type: Date, default: Date.now },
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    posts: [
        {
            _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
            image_url: { type: String },
            caption: { type: String },
            post_date: { type: Date, default: Date.now },
            comments: [commentSchema],
            likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
    ],
    save_post: [
        {
            user_id: { type: Schema.Types.ObjectId, ref: 'User' },
            post_id: { type: Schema.Types.ObjectId },
        },
    ],
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
});

const tagSchema = new Schema({
    name: { type: String, unique: true },
});

const User = mongoose.model('User', userSchema);
const Tag = mongoose.model('Tag', tagSchema);

export { User, Tag };
