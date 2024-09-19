import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import UserActivity from '../mongoose/schemas/userActivity.mjs';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on('connection', async (socket) => {
    console.log('a user connected', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
        await UserActivity.findOneAndUpdate({ user_id: userId }, { last_active: new Date() }, { upsert: true });
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', async () => {
        console.log('user disconnected', socket.id);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
        await UserActivity.findOneAndUpdate({ user_id: userId }, { last_active: new Date() }, { upsert: true });
    });
});

export const sendSocketNotification = (receiverId, event, data) => {
    if (!receiverId) {
        console.log('Invalid receiver ID: undefined');
        return;
    }
};

export { app, io, server };
