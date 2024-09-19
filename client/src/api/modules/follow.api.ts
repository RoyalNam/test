import publicClient from '../client/public.client';

const followEndpoint = {
    follower: ({ authId, userId }: { authId: string; userId: string }) => `/${authId}/followers/${userId}`,
    following: ({ authId, userId }: { authId: string; userId: string }) => `/${authId}/following/${userId}`,
};

const followApi = {
    addFollower: async ({ authId, userId }: { authId: string; userId: string }) => {
        const resp = await publicClient.post(followEndpoint.follower({ authId, userId }));
        return resp.data;
    },
    removeFollower: async ({ authId, userId }: { authId: string; userId: string }) => {
        const resp = await publicClient.delete(followEndpoint.follower({ authId, userId }));
        return resp.data;
    },
    followUser: async ({ authId, userId }: { authId: string; userId: string }) => {
        const resp = await publicClient.post(followEndpoint.following({ authId, userId }));
        return resp.data;
    },
    unFollower: async ({ authId, userId }: { authId: string; userId: string }) => {
        const resp = await publicClient.delete(followEndpoint.following({ authId, userId }));
        return resp.data;
    },
};
export default followApi;
