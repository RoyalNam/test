import mongoose, { Schema } from 'mongoose';
import { commentSchema } from './comment.mjs';

const postSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        image_url: { type: String },
        caption: { type: String },
        comments: [commentSchema],
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true },
);

const Post = mongoose.model('Post', postSchema);
export default Post;
