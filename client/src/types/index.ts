interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    account: {
        type: string;
        account_id: string;
    };
    password: string;
    bio: string;
    join_date: Date;
    following: string[];
    followers: string[];
    posts: Post[];
    save_post: SavePost[];
    tags: string[];
}

interface MinimalUser {
    _id: string;
    name: string;
    avatar: string;
}

interface Post {
    _id: string;
    image_url: string;
    caption: string;
    post_date: Date;
    comments: Comment[];
    likes: string[];
}

interface Comment {
    _id: string;
    user: string;
    comment_text: string;
    comment_date: string;
    replies: Comment[];
}
interface SavePost {
    user_id: string;
    post_id: string;
}

interface Tag {
    _id: string;
    name: string;
}

interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    message: string;
    createdAt: string;
    updatedAt: string;
}
interface Conversation {
    _id: string;
    participants: string[];
    message: string[];
}
interface Notification {
    _id: string;
    user: string;
    action: 'messaged' | 'commented' | 'replied' | 'liked';
    content?: string;
    sender: string;
    read: boolean;
    created_at: string;
}

export interface PostProps {
    author: MinimalUser;
    post: Post;
}

export interface CommentProps {
    comment: Comment;
    author: MinimalUser;
}
interface UserActivity {
    user_id: string;
    last_active: string;
}
export type { MinimalUser, Notification, User, Post, Comment, Tag, Message, Conversation, SavePost, UserActivity };
