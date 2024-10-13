'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { MinimalUser, UserActivity } from '@/types';
import { useAuthContextProvider } from './authUserContext';
import { messageApi, otherApi, userApi } from '@/api/modules';

interface ChatUsersContextType {
    chatUsers: MinimalUser[];
    usersActivity: UserActivity[];
    updateChatUsers: (updatedUser: MinimalUser) => void;
    updateUsersActivity: (updatedUser: UserActivity) => void;
}

const ChatUsersContext = createContext<ChatUsersContextType | null>(null);

const ChatUsersContextProvider = ({ children }: { children: React.ReactNode }) => {
    const { authUser } = useAuthContextProvider();
    const [chatUsers, setChatUsers] = useState<MinimalUser[]>([]);
    const [usersActivity, setUsersActivity] = useState<UserActivity[]>([]);
    const [chatUsersUpdated, setChatUsersUpdated] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            if (authUser) {
                try {
                    const activeChatUserIds: string[] = await messageApi.getUsersChat();

                    if (activeChatUserIds && activeChatUserIds.length > 0) {
                        const chatUserData = await userApi.getBasicInfoByIds(activeChatUserIds);
                        const activeUserActivityData = await otherApi.getUsersActivity(activeChatUserIds);
                        setUsersActivity(activeUserActivityData);

                        if (chatUserData && chatUserData.length > 0)
                            setChatUsers(chatUserData.filter((user) => user !== null) as MinimalUser[]);
                    }
                } catch (err) {
                    throw err;
                }
            }
        };
        fetchData();
    }, [authUser]);
    useEffect(() => {
        if (chatUsersUpdated && chatUsers.length > 0) {
            const fetchData = async () => {
                try {
                    const userActivity = await otherApi.getUserActivity({ userId: chatUsers[0]._id });
                    updateUsersActivity(userActivity);
                } catch (err) {
                    console.error('Error fetching user activity:', err);
                }
            };
            fetchData();
            setChatUsersUpdated(false);
        }
    }, [chatUsersUpdated]);

    const updateChatUsers = (updatedUser: MinimalUser) => {
        setChatUsers((prevUsers) => [updatedUser, ...prevUsers]);
        setChatUsersUpdated(true);
    };

    const updateUsersActivity = (updatedUser: UserActivity) => {
        setUsersActivity((prevUsers) => [updatedUser, ...prevUsers]);
    };

    const contextValue: ChatUsersContextType = {
        chatUsers,
        usersActivity,
        updateChatUsers,
        updateUsersActivity,
    };

    return <ChatUsersContext.Provider value={contextValue}>{children}</ChatUsersContext.Provider>;
};

const useChatUsersContextProvider = (): ChatUsersContextType => {
    const context = useContext(ChatUsersContext);
    if (!context) {
        throw new Error('useChatUsersContextProvider must be used within a ChatUsersContextProvider');
    }
    return context;
};

export { ChatUsersContextProvider, useChatUsersContextProvider };
