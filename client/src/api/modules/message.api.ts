import privateClient from '../client/private.client';

const messageBaseUrl = '/message';
const messageEndpoint = {
    users_chat: `${messageBaseUrl}/`,
    send_message: ({ receiverId }: { receiverId: string }) => `${messageBaseUrl}/${receiverId}`,
    get_message: ({ userToChatId, lastMessageId }: { userToChatId: string; lastMessageId?: string }) =>
        `${messageBaseUrl}/${userToChatId}?${lastMessageId ? `lastMessageId=${lastMessageId}` : ''}`,
};

const messageApi = {
    getUsersChat: async () => {
        const resp = await privateClient.get(messageEndpoint.users_chat);
        return resp.data;
    },
    sendMessage: async ({ receiverId, message }: { receiverId: string; message: string }) => {
        const resp = await privateClient.post(messageEndpoint.send_message({ receiverId }), {
            message,
        });
        return resp.data;
    },
    getMessages: async ({ userToChatId, lastMessageId }: { userToChatId: string; lastMessageId?: string }) => {
        const resp = await privateClient.get(messageEndpoint.get_message({ userToChatId, lastMessageId }));
        return resp.data;
    },
};

export default messageApi;
