import privateClient from '../client/private.client';
import publicClient from '../client/public.client';

const postBaseUrl = '/posts';
const postEndpoint = {
    create_post: postBaseUrl,
    get_post: ({ userId, postId }: { userId: string; postId: string }) => `/${userId}/posts/${postId}`,
    get_posts: ({ numberOfPostsToShow = 10 }: { numberOfPostsToShow?: number }) =>
        `${postBaseUrl}?numberOfPostsToShow=${numberOfPostsToShow}`,
    toggle_save_post: `${postBaseUrl}/save`,
    toggle_like_post: ({ userId, postId }: { userId: string; postId: string }) =>
        `${postEndpoint.get_post({ userId, postId })}/like`,
    create_comment: ({ postId }: { postId: string }) => `${postBaseUrl}/${postId}/comments`,
    reply_comment: ({ postId, commentId }: { postId: string; commentId: string }) =>
        `${postBaseUrl}/${postId}/comments/${commentId}/replies`,
};

const postApi = {
    createPost: async (data: any) => {
        const resp = await privateClient.post(postEndpoint.create_post, data);
        return resp.data;
    },
    getPostById: async (userId: string, postId: string) => {
        const resp = await publicClient.get(postEndpoint.get_post({ userId, postId }));
        return resp.data;
    },
    getPosts: async (numberOfPostsToShow = 10) => {
        const resp = await publicClient.get(postEndpoint.get_posts({ numberOfPostsToShow }));
        return resp.data;
    },
    toggleSavePost: async ({ userId, postId }: { userId: string; postId: string }) => {
        const resp = await privateClient.post(postEndpoint.toggle_save_post, { userId, postId });
        return resp.data;
    },
    toggleLikePost: async ({ userId, postId }: { userId: string; postId: string }) => {
        const resp = await privateClient.post(postEndpoint.toggle_like_post({ userId, postId }), {});
        return resp.data;
    },
    createComment: async ({ postId, data }: { postId: string; data: any }) => {
        const resp = await privateClient.post(postEndpoint.create_comment({ postId }), data);
        return resp.data;
    },
    replyComment: async ({ postId, commentId, data }: { postId: string; commentId: string; data: any }) => {
        const resp = await privateClient.post(postEndpoint.reply_comment({ postId, commentId }), data);
        return resp.data;
    },
};
export default postApi;
