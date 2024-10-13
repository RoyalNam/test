import privateClient from '../client/private.client';
import publicClient from '../client/public.client';

const postBaseUrl = '/posts';
const postEndpoint = {
    create_post: postBaseUrl,
    get_post: ({ postId }: { postId: string }) => `/posts/${postId}`,
    get_posts: ({
        numberOfPostsToShow,
        previousPostIds,
    }: {
        numberOfPostsToShow?: number;
        previousPostIds: string[];
    }) => {
        const previousIdsParam = previousPostIds.length ? `&previousPostIds=${previousPostIds.join(',')}` : '';
        return `${postBaseUrl}?numberOfPostsToShow=${numberOfPostsToShow}${previousIdsParam}`;
    },
    toggle_save_post: `${postBaseUrl}/save`,
    toggle_like_post: ({ postId }: { postId: string }) => `${postEndpoint.get_post({ postId })}/like`,
    create_comment: ({ postId }: { postId: string }) => `${postBaseUrl}/${postId}/comments`,
    reply_comment: ({ postId, commentId }: { postId: string; commentId: string }) =>
        `${postBaseUrl}/${postId}/comments/${commentId}/replies`,
};

const postApi = {
    createPost: async (data: any) => {
        const resp = await privateClient.post(postEndpoint.create_post, data);
        return resp.data;
    },
    getPostById: async (postId: string) => {
        const resp = await publicClient.get(postEndpoint.get_post({ postId }));
        return resp.data;
    },
    getPosts: async (previousPostIds: string[] = [], numberOfPostsToShow = 10) => {
        const resp = await publicClient.get(
            postEndpoint.get_posts({
                previousPostIds,
                numberOfPostsToShow,
            }),
        );
        return resp.data;
    },
    toggleSavePost: async ({ postId }: { postId: string }) => {
        const resp = await privateClient.post(postEndpoint.toggle_save_post, { postId });
        return resp.data;
    },
    toggleLikePost: async ({ postId }: { postId: string }) => {
        const resp = await privateClient.post(postEndpoint.toggle_like_post({ postId }));
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
