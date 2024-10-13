'use client';
import React, { createContext, useState, useEffect, useContext } from 'react';
import io, { Socket } from 'socket.io-client';

import { useAuthContextProvider } from './authUserContext';
import { baseURL } from '@/api/client/private.client';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
}
const SocketContext = createContext<SocketContextType | null>(null);

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { authUser } = useAuthContextProvider();

    useEffect(() => {
        if (authUser) {
            const newSocket = io(baseURL, {
                query: {
                    userId: authUser._id,
                },
                withCredentials: true,
            });
            setSocket(newSocket);

            newSocket.on('getOnlineUsers', (users) => {
                setOnlineUsers(users);
            });

            return () => {
                newSocket.off('getOnlineUsers');
                newSocket.close();
                setSocket(null);
            };
        }
    }, [authUser]);

    const contextValue: SocketContextType = {
        socket,
        onlineUsers,
    };

    return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('SocketContext must be used within an SocketContextProvider');
    return context;
};
