interface MinimalUser {
    _id: string;
    name: string;
    avatar: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    account?: {
        type: 'facebook' | 'google';
        account_id?: string;
    };
    password?: string;
    bio?: string;
    following: string[];
    followers: string[];
    posts: string[];
    save_post: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface Comment {
    _id: string;
    user_id: string;
    comment_text: string;
    replies: Comment[];
    createdAt: Date;
    updatedAt: Date;
}

interface Conversation {
    _id: string;
    participants: string[];
    messages: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Notification {
    _id: string;
    user_id: string;
    action: string;
    content?: string;
    sender: string;
    read?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface Post {
    _id: string;
    user_id: string;
    image_url?: string;
    caption?: string;
    comments: Comment[];
    likes: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface UserActivity {
    _id: string;
    user_id: string;
    last_active: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type { MinimalUser, User, Comment, Conversation, Message, Notification, Post, UserActivity };
