export const createUserValidationSchema = {
    email: {
        notEmpty: true,
        isEmail: true,
        errorMessage: 'Invalid email',
    },
    name: {
        notEmpty: true,
    },
    password: {
        errorMessage: 'Password must be at least 6 characters long',
        isLength: {
            options: { min: 6 },
        },
    },
    avatar: {
        optional: true,
    },
    bio: {
        optional: true,
    },
    join_date: {
        optional: true,
        isISO8601: true,
        toDate: true,
    },
    following: {
        optional: true,
        isArray: true,
    },
    followers: {
        optional: true,
        isArray: true,
    },
    'posts.*.image_url': {
        optional: true,
        isURL: true,
        errorMessage: 'Invalid image URL',
    },
    'posts.*.caption': {
        optional: true,
    },
    'posts.*.post_date': {
        optional: true,
        isISO8601: true,
        toDate: true,
    },
    'posts.*.comments.*.comment_text': {
        optional: true,
    },
    'posts.*.comments.**.replies.*.comment_text': {
        optional: true,
    },
    'save_post.*.user_id': {
        optional: true,
        isArray: true,
    },
    'save_post.*.post_id': {
        optional: true,
        isArray: true,
    },
    tags: {
        optional: true,
        isArray: true,
    },
};
