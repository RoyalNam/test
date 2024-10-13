import mongoose, { Schema } from 'mongoose';

const userActivitySchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        last_active: {
            type: Date,
            default: Date.now,
            validate: {
                validator: (value) => !isNaN(Date.parse(value)), // Validate that value is a valid date
                message: (props) => `${props.value} is not a valid date format for the last_active field.`,
            },
        },
    },
    { timestamps: true },
);

const UserActivity = mongoose.model('UserActivity', userActivitySchema);
export default UserActivity;
