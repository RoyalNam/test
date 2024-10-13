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
    following: {
        optional: true,
        isArray: true,
    },
    followers: {
        optional: true,
        isArray: true,
    },
    followers: {
        optional: true,
        isArray: true,
    },
    posts: {
        optional: true,
        isArray: true,
    },
    save_post: {
        optional: true,
        isArray: true,
    },
};
