import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import UserActivity from '../mongoose/schemas/userActivity.mjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        // credentials: true,
    },
});

const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

io.on('connection', async (socket) => {
    console.log('A user connected', socket.id);

    const userId = socket.handshake.query.userId;

    if (userId && userId !== 'undefined') {
        userSocketMap[userId] = socket.id;
        await UserActivity.findOneAndUpdate({ user_id: userId }, { last_active: new Date() }, { upsert: true });
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', async () => {
        console.log('User disconnected', socket.id);

        if (userId) {
            delete userSocketMap[userId];
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
            await UserActivity.findOneAndUpdate({ user_id: userId }, { last_active: new Date() }, { upsert: true });
        }
    });
});

export const sendSocketNotification = (receiverId, event, data) => {
    const socketId = getReceiverSocketId(receiverId);
    if (!socketId) {
        console.log(`Socket ID not found for receiver ID: ${receiverId}`);
        return;
    }

    io.to(socketId).emit(event, data);
};

export { app, io, server };
