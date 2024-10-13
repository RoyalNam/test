'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BsArrowUpSquareFill, BsCameraVideo, BsInfoCircle, BsTelephone } from 'react-icons/bs';

import { Message, MinimalUser } from '@/types';
import { timeAgoFromPast } from '@/utils';
import { useAuthContextProvider } from '@/context/authUserContext';
import { useSocketContext } from '@/context/socketContext';
import { formatDateTime } from '@/utils';
import { useChatUsersContextProvider } from '@/context/chatUsersContext';
import { messageApi, userApi } from '@/api/modules';

export default function Messages() {
    const router = useRouter();
    const { receiverId } = useParams();
    const { authUser } = useAuthContextProvider();
    const { chatUsers, usersActivity, updateChatUsers } = useChatUsersContextProvider();
    const { onlineUsers, socket } = useSocketContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const inputRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userToChat, setUserToChat] = useState<MinimalUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = await userApi.getBasicInfoById(receiverId as string);

                setUserToChat(user);
                const messagesResp = await messageApi.getMessages({
                    userToChatId: receiverId as string,
                });
                if (messagesResp) setMessages(messagesResp);
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } catch (err) {
                // throw err;
                setUserToChat(null);
                console.log('error', err);
            } finally {
                setLoading(false);
            }
        };
        if (receiverId) fetchData();
    }, [receiverId]);

    useEffect(() => {
        const handleMessage = (newMessage: any) => {
            newMessage.shouldShake = true;
            const sound = new Audio('/notification.mp3');
            sound.play();
            setMessages((prevMessages) => [newMessage, ...prevMessages]);
        };
        socket?.on('newMessage', handleMessage);
        return () => {
            socket?.off('newMessage', handleMessage);
        };
    }, [socket, setMessages, messages]);

    const handleSendMessage = async () => {
        try {
            if (inputRef.current && inputRef.current.innerText.trim() !== '' && receiverId) {
                const sendMsg = await messageApi.sendMessage({
                    receiverId: receiverId as string,
                    message: inputRef.current.innerText,
                });

                if (sendMsg) {
                    setMessages((prev) => [sendMsg.message, ...prev]);
                    inputRef.current.innerText = '';
                }
                const isReceiverInArray = chatUsers.some((item) => item._id === receiverId);
                if (!isReceiverInArray && userToChat) {
                    updateChatUsers(userToChat);
                }
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
        } catch (err) {
            throw err;
        }
    };

    const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;

        if (target.scrollTop === 0) {
            try {
                const lastMessageId = messages.length > 0 ? messages[messages.length - 1]._id : '';
                const messagesResp = await messageApi.getMessages({
                    userToChatId: receiverId as string,
                    lastMessageId: lastMessageId,
                });
                if (messagesResp) {
                    setMessages((prevMessages) => [...prevMessages, ...messagesResp]);
                }
                console.log('Fetched previous messages:', messagesResp);
            } catch (err) {
                console.error('Error while fetching previous messages:', err);
            }
        }
    };

    const redirectUserProfile = (userId: string) => {
        router.push(`/profile/${userId}`);
    };

    const renderText = (message: Message) => (
        <div key={message._id} className="flex flex-col gap-1">
            <span className="mx-auto text-xs">{formatDateTime(new Date(message.updatedAt))}</span>
            <pre
                className={`${
                    message.senderId == authUser?._id
                        ? 'ml-auto text-white bg-blue-500'
                        : 'mr-auto bg-black/10 dark:bg-white/15'
                } text-wrap break-words leading-4 max-w-[40%] rounded-3xl px-3 py-2`}
            >
                {message.message}
            </pre>
        </div>
    );

    return !loading ? (
        userToChat ? (
            <div className="w-full flex flex-col">
                <div className="border-b border-black/30 dark:border-white/20 flex items-center justify-between px-4 py-2">
                    <div className="flex">
                        <div className="relative w-12 h-12">
                            <img
                                src={userToChat.avatar ?? '/user.png'}
                                alt={userToChat.name}
                                className="rounded-full w-full h-full object-cover"
                            />
                            {onlineUsers.includes(userToChat._id) && (
                                <span className="absolute right-1 bottom-0 w-4 h-4 bg-black flex justify-center items-center rounded-full">
                                    <span className="w-3.5 h-3.5 bg-green-600 rounded-full"></span>
                                </span>
                            )}
                        </div>

                        <div className="leading-4 ml-2 mt-2">
                            <h5 className="font-semibold">{userToChat.name}</h5>
                            <span>
                                {onlineUsers.includes(userToChat._id)
                                    ? 'Active Now'
                                    : (function () {
                                          const userActivity = usersActivity.find(
                                              (user) => user && user.user_id === userToChat._id,
                                          );
                                          if (userActivity && userActivity.last_active) {
                                              const lastActiveDate = new Date(userActivity.last_active);
                                              return timeAgoFromPast(lastActiveDate);
                                          }
                                          return 'Not recently active';
                                      })()}
                            </span>
                        </div>
                    </div>
                    <div className="text-2xl flex">
                        <button title="Call" className="p-2">
                            <BsTelephone />
                        </button>
                        <button title="Call" className="p-2">
                            <BsCameraVideo />
                        </button>
                        <button title="Info" className="p-2">
                            <BsInfoCircle />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-scroll scroll_thin" onScroll={handleScroll}>
                    <div className="flex flex-col items-center text-center mb-8">
                        <img
                            src={userToChat.avatar ?? '/user.png'}
                            alt=""
                            className="rounded-full w-16 h-16 cursor-pointer"
                        />
                        <h5 className="font-semibold mt-1">{userToChat.name}</h5>
                        <button
                            className="font-semibold text-sm px-3 py-0.5 mt-2 bg-white/20 rounded"
                            onClick={() => redirectUserProfile(userToChat._id)}
                        >
                            View Profile
                        </button>
                    </div>
                    <div className="flex gap-6 flex-col-reverse justify-end" ref={messagesEndRef}>
                        {messages.map((message) => renderText(message))}
                    </div>
                </div>

                <div className="mb-4 relative mx-4 flex items-end rounded-3xl border dark:border-white/20 overflow-hidden">
                    <div
                        contentEditable
                        title="message input"
                        ref={inputRef}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (!e.shiftKey) {
                                    handleSendMessage();
                                    e.preventDefault();
                                }
                            }
                        }}
                        onChange={(e) => {
                            const div = e.target as HTMLDivElement;
                            if (div) {
                                div.style.height = 'auto';
                                div.style.height = div.scrollHeight + 'px';
                            }
                        }}
                        className="w-full pl-4 pr-8 py-2 scroll_thin overflow-y-auto max-h-24 bg-transparent outline-none"
                    />

                    <button title="send" className="absolute right-2 p-2 bottom-0" onClick={handleSendMessage}>
                        <BsArrowUpSquareFill className="text-2xl" />
                    </button>
                </div>
            </div>
        ) : (
            <div className="flex items-center justify-center flex-1">
                <h5 className="text text-red-500">User not found</h5>
            </div>
        )
    ) : null;
}
