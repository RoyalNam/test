import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User' },
        comment_text: { type: String, required: true },
    },
    { timestamps: true },
);

commentSchema.add({
    replies: [commentSchema],
});

const Comment = mongoose.model('Comment', commentSchema);
export { commentSchema };
export default Comment;
