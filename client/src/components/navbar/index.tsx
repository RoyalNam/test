'use client';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    BsArrowBarLeft,
    BsBell,
    BsBellFill,
    BsChatDots,
    BsChatDotsFill,
    BsCompass,
    BsCompassFill,
    BsHouse,
    BsHouseFill,
    BsPlusCircle,
    BsSearch,
} from 'react-icons/bs';

import Notifications from './Notifications';
import Search from './Search';
import CreatePost from '../post/CreatePost';
import { useAuthContextProvider } from '@/context/authUserContext';
import { useSocketContext } from '@/context/socketContext';
import { Notification } from '@/types';
import { userApi } from '@/api/modules';

interface NavProps {
    tit: string;
    to?: string;
    icon: React.ReactNode;
    actIcon?: React.ReactNode;
    onclick?: () => void;
}

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { authUser } = useAuthContextProvider();
    const { socket } = useSocketContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isShowSearch, setShowSearch] = useState(false);
    const [isShowNotifications, setShowNotifications] = useState(false);
    const [isShowCreatePost, setShowCreatePost] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (authUser) {
                    const notificationData = await userApi.getNotifications(authUser._id);
                    console.log('notifications', notificationData);
                    setNotifications(notificationData.notifications);
                }
            } catch (error) {
                throw error;
            }
        };
        fetchData();
    }, [authUser]);

    useEffect(() => {
        const handleNotification = (newNotification: any) => {
            const sound = new Audio('/notification.mp3');
            sound.play();
            setNotifications((prev) => [newNotification, ...prev]);
        };
        socket?.on('newNotification', handleNotification);
        return () => {
            socket?.off('newNotification', handleNotification);
        };
    }, [socket, setNotifications, notifications]);

    const NAV_LINK: NavProps[] = [
        {
            tit: 'Home',
            to: '/',
            icon: <BsHouse />,
            actIcon: <BsHouseFill />,
        },
        {
            tit: 'Search',
            icon: <BsSearch />,
            onclick: () => {
                if (isShowNotifications) setShowNotifications(false);
                setShowSearch(!isShowSearch);
            },
        },
        {
            tit: 'Explore',
            to: '/explore',
            icon: <BsCompass />,
            actIcon: <BsCompassFill />,
        },
        {
            tit: 'Messages',
            to: '/messages',
            icon: <BsChatDots />,
            actIcon: <BsChatDotsFill />,
        },
        {
            tit: 'Notifications',
            icon: (
                <div className="relative">
                    <BsBell />
                    <span className="absolute -right-0.5 -top-1 z-10 rounded-full text-white bg-red-500 w-3.5 h-3.5 text-xs">
                        {notifications.filter((item) => !item.read).length}
                    </span>
                </div>
            ),
            actIcon: (
                <div className="relative">
                    <BsBellFill />
                    <span className="absolute -right-0.5 -top-1 z-10 rounded-full text-white bg-red-500 w-3.5 h-3.5 text-xs">
                        {notifications.filter((item) => !item.read).length}
                    </span>
                </div>
            ),
            onclick: () => {
                if (isShowSearch) setShowSearch(false);
                setShowNotifications(!isShowNotifications);
            },
        },
        {
            tit: 'Create',
            icon: <BsPlusCircle />,
            onclick: () => setShowCreatePost(true),
        },
        {
            tit: 'Profile',
            to: `/profile/${authUser?._id}`,
            icon: <img src={authUser?.avatar ?? '/user.png'} alt="" className="rounded-full w-6 h-6" />,
            actIcon: <img src={authUser?.avatar ?? '/user.png'} alt="" className="rounded-full  w-6 h-6" />,
        },
    ];

    const handleCloseSidebar = () => {
        if (isShowNotifications) setShowNotifications(false);
        if (isShowSearch) setShowSearch(false);
    };
    const handleLogout = async () => {
        try {
            const isLogout = await userApi.logout();
            localStorage.removeItem('authToken');
            router.push('/account/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };
    const renderNavItem = (item: NavProps) => {
        const isAct =
            item.to && ((pathname === '/' && item.to === '/') || (pathname.startsWith(item.to) && item.to !== '/'));

        return (
            <button
                title={item.tit}
                key={item.tit}
                onClick={
                    item.onclick
                        ? item.onclick
                        : () => {
                              handleCloseSidebar();
                              router.push(item.to as string);
                          }
                }
                className="flex gap-2 items-center px-3 py-1 md:py-3 rounded-xl hover:bg-transparent md:hover:bg-black/10 dark:md:hover:bg-white/10"
            >
                <span className="text-2xl">
                    {isAct
                        ? item.actIcon
                        : item.tit === 'Notifications' && isShowNotifications
                        ? item.actIcon
                        : item.icon}
                </span>

                <span className={`lg:block hidden ${isShowSearch || isShowNotifications ? '!hidden' : ''}`}>
                    {item.tit}
                </span>
            </button>
        );
    };

    const RenderSidebar = ({ children }: { children: React.ReactNode }) => (
        <div className="fixed inset-x-0 bottom-0 md:left-16 top-[49px] z-20 md:top-0">
            <div className="absolute inset-0" onClick={handleCloseSidebar} />
            <div className="md:w-[400px] h-full border-r p-4 border-black/30 dark:border-white/10 min-h-[20vh bg-white dark:bg-primary w-full relative z-40">
                {children}
            </div>
        </div>
    );
    return (
        <div
            className={`relative lg:w-60 w-full md:w-16 p-2 flex flex-col md:block border-b md:border-r border-black/30 dark:border-white/10 ${
                isShowSearch || isShowNotifications ? 'md:!w-16 !w-full' : ''
            }`}
        >
            <div
                onClick={() => {
                    handleCloseSidebar();
                    router.push('/');
                }}
                className="hidden md:block mb-6 py-2 cursor-pointer"
            >
                <img
                    src="/logo.png"
                    alt=""
                    className={`object-cover lg:ml-3 w-full max-w-16 rounded-full ${
                        isShowSearch || isShowNotifications ? '!block' : ''
                    }`}
                />
            </div>
            <div className="flex-1 select-none flex flex-row justify-around md:flex-col gap-0 md:gap-2">
                {NAV_LINK.map((item: NavProps) => renderNavItem(item))}
            </div>
            <div
                onClick={handleLogout}
                className="hidden rounded-full mt-4 mx-2 p-2 bg-red-400 text-white md:inline-block"
            >
                <button className={`lg:block hidden ${isShowSearch || isShowNotifications ? '!hidden' : ''}`}>
                    Logout
                </button>
                <button
                    className={`block lg:hidden ${isShowSearch || isShowNotifications ? '!block' : ''}`}
                    title="logout"
                >
                    <BsArrowBarLeft className="text-xl" />
                </button>
            </div>
            {isShowSearch && (
                <RenderSidebar>
                    <Search />
                </RenderSidebar>
            )}
            {isShowNotifications && (
                <RenderSidebar>
                    <Notifications notifications={notifications} />
                </RenderSidebar>
            )}
            <CreatePost show={isShowCreatePost} onClose={() => setShowCreatePost(false)} />
        </div>
    );
};

export default Navbar;
