'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsPencilSquare, BsX } from 'react-icons/bs';

import { useChatUsersContextProvider } from '@/context/chatUsersContext';
import { useSocketContext } from '@/context/socketContext';
import { formatNumber, timeAgoFromPast } from '@/utils';
import Modal from '@/components/Modal';
import { User } from '@/types';
import { useAuthContextProvider } from '@/context/authUserContext';
import Navbar from '@/components/navbar';
import { userApi } from '@/api/modules';

export default function MessagesLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const { authUser } = useAuthContextProvider();
    const { onlineUsers } = useSocketContext();
    const { chatUsers, usersActivity } = useChatUsersContextProvider();
    const [isShowChatModel, setShowChatModel] = useState(false);
    const [foundUsers, setFoundUsers] = useState<User[]>([]);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authUser) setLoading(false);
    }, [authUser]);
    const redirectMessage = (userId: string) => {
        router.push(`/messages/${userId}`);
    };

    const renderSidebar = () => (
        <div className="w-28 lg:w-96 flex flex-col mt-8 select-none">
            <div className="inline-flex justify-between items-center px-4">
                <h4 className="font-bold hidden lg:block">Messages</h4>
                <button title="Create" className="p-2 mx-auto lg:mx-0" onClick={() => setShowChatModel(true)}>
                    <BsPencilSquare className="text-2xl" />
                </button>
            </div>
            {chatUsers && chatUsers.length == 0 ? (
                <div className="flex-1 flex justify-center items-center mr-2">
                    <span className="text-center text-sm">No messages found.</span>
                </div>
            ) : (
                chatUsers.length > 0 && (
                    <div className="overflow-y-scroll scroll_thin h-full pb-8">
                        <div className="flex flex-col mt-4 items-center lg:items-start">
                            {chatUsers.map((item, idx) => (
                                <div
                                    className="flex w-full px-3 py-1.5 gap-2 hover:bg-black/20 dark:hover:bg-white/20 items-center cursor-pointer"
                                    key={item._id}
                                    onClick={() => redirectMessage(item._id)}
                                >
                                    <div className="relative w-14 h-14">
                                        <img
                                            src={item.avatar ?? '/user.png'}
                                            alt={item.name}
                                            className="rounded-full w-full h-full object-cover"
                                        />
                                        {onlineUsers.includes(item._id) && (
                                            <span className="absolute right-1 bottom-0 w-4 h-4 bg-black flex justify-center items-center rounded-full">
                                                <span className="w-3.5 h-3.5 bg-green-600 rounded-full"></span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="hidden lg:block flex-1">
                                        <h5 className="font-semibold">{item.name}</h5>
                                        <span className="text-sm font-extralight line-clamp-1">
                                            {usersActivity.length > 0 &&
                                                (onlineUsers.includes(item._id)
                                                    ? 'Active Now'
                                                    : usersActivity[idx]?.last_active
                                                    ? timeAgoFromPast(new Date(usersActivity[idx].last_active))
                                                    : 'Not recently active')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );

    const handleSearch = async () => {
        try {
            const users = await userApi.searchUsers(searchValue);
            setFoundUsers(users);
        } catch (error) {
            throw error;
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            handleSearch();
        }
    };

    useEffect(() => {
        if (searchValue.trim() !== '') {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            const id = setTimeout(handleSearch, 1200);
            setTimeoutId(id as NodeJS.Timeout);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [searchValue]);
    return !loading ? (
        <>
            <div className="flex h-screen flex-col md:flex-row">
                <Navbar />
                <main className="flex-1 overflow-hidden">
                    <div className="w-full h-full">
                        <div className="flex h-full">
                            {renderSidebar()}
                            <div className="flex-1 overflow-hidden flex border-l">{children}</div>
                        </div>
                    </div>
                </main>
            </div>
            <Modal show={isShowChatModel} onClose={() => setShowChatModel(false)}>
                <div className="z-50 rounded bg-white dark:bg-primary w-[548px] h-[530px] flex flex-col p-4">
                    <div className="relative">
                        <h5 className="text-center pb-2 font-bold">New message</h5>
                        <button
                            title="Close"
                            className="absolute -right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowChatModel(false)}
                        >
                            <BsX className="text-4xl" />
                        </button>
                    </div>
                    <div className="border-y dark:border-white/20 border-black/30 flex items-center -mx-3 px-3">
                        <span>To:</span>
                        <input
                            type="text"
                            title="To"
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="py-2 px-3 bg-transparent text-sm outline-none flex-1"
                        />
                        {/* <span onClick={handleSearch}>ENter</span> */}
                    </div>

                    <div className="flex-1 overflow-y-scroll scroll_thin my-3">
                        <div className="h-full">
                            {foundUsers.length > 0 ? (
                                <div className="flex flex-col">
                                    {foundUsers.map((item) => (
                                        <div
                                            key={item._id}
                                            className="flex items-center py-2 px-3 rounded cursor-pointer gap-2 hover:bg-black/5 dark:hover:bg-white/15"
                                            onClick={() => {
                                                setShowChatModel(false);
                                                setSearchValue('');
                                                setFoundUsers([]);
                                                router.push(`/messages/${item._id}`);
                                            }}
                                        >
                                            <img
                                                src={item.avatar ?? '/user.png'}
                                                alt=""
                                                className="w-12 h-12 rounded-full"
                                            />
                                            <div className="flex-1 leading-6">
                                                <h5 className="font-semibold">{item.name}</h5>
                                                <span className="text-sm font-light">{`${formatNumber(
                                                    item.followers.length,
                                                )} followers`}</span>
                                            </div>
                                            {/* <button title="Remove" className="hover:opacity-75">
                                        <BsXLg />
                                    </button> */}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>No account found</span>
                            )}
                        </div>
                    </div>
                    {/* <button className="bg-blue-500 w-full rounded-full py-2 font-semibold opacity-60">Chat</button> */}
                </div>
            </Modal>
        </>
    ) : null;
}
