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
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { authUser } = useAuthContextProvider();

    useEffect(() => {
        let socket: Socket | undefined;

        if (authUser) {
            socket = io(baseURL, {
                query: {
                    userId: authUser._id,
                },
            });
            setSocket(socket);

            socket.on('getOnlineUsers', (users) => {
                setOnlineUsers(users);
            });

            return () => {
                if (socket) {
                    socket.close();
                    setSocket(null);
                }
            };
        }

        return () => {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        };
    }, [authUser]);
    const contextValue: SocketContextType = {
        socket: socket,
        onlineUsers: onlineUsers,
    };
    return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export const useSocketContext = (): SocketContextType => {
    const context = useContext(SocketContext);
    if (!context) throw new Error('SocketContext must be used within an SocketContextProvider');
    return context;
};
