import mongoose, { Schema } from 'mongoose';

const userActivitySchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    last_active: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (value) {
                return new Date(value).toISOString() === value;
            },
            message: (props) => `${props.value} is not a valid ISO8601 date format for last_active field.`,
        },
    },
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;
