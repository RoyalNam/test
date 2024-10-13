'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { timeAgoFromPast } from '@/utils';
import { MinimalUser, Notification } from '@/types';
import { userApi } from '@/api/modules';

const Notifications = ({ notifications }: { notifications: Notification[] }) => {
    const router = useRouter();
    const [displayedNotificationIds, setDisplayedNotificationIds] = useState<string[]>([]);
    const [userMap, setUserMap] = useState<{ [userId: string]: MinimalUser }>({});
    const [todayNotifications, setTodayNotifications] = useState<Notification[]>([]);
    const [otherNotifications, setOtherNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            for (const notification of notifications) {
                if (!displayedNotificationIds.includes(notification._id)) {
                    const user = await userApi.getBasicInfoById(notification.sender);
                    setUserMap((prevMap) => ({ ...prevMap, [notification.sender]: user }));
                    setDisplayedNotificationIds((prevIds) => [...prevIds, notification._id]);
                }
            }
        };
        fetchData();
    }, [notifications]);

    useEffect(() => {
        const today = new Date();
        const todayNotifications = notifications.filter((notification) => {
            const notificationDate = new Date(notification.createdAt);
            return (
                notificationDate.getDate() === today.getDate() &&
                notificationDate.getMonth() === today.getMonth() &&
                notificationDate.getFullYear() === today.getFullYear()
            );
        });
        setTodayNotifications(todayNotifications);

        const otherNotifications = notifications.filter((notification) => !todayNotifications.includes(notification));
        setOtherNotifications(otherNotifications);
    }, [notifications]);

    const renderNotification = (notification: Notification) => {
        const user = userMap[notification.sender];
        const handleClick = () => {
            switch (notification.action) {
                case 'messaged':
                    router.push(`/messages/${notification.sender}`);
                    break;
                case 'commented':
                case 'liked':
                case 'replied':
                    router.push('#');
                    break;
                default:
                    // Handle default action or do nothing
                    break;
            }
        };
        return (
            <div
                key={notification._id}
                onClick={handleClick}
                className={`hover:bg-black/10 dark:hover:bg-white/30 flex gap-3 px-3 py-2 cursor-pointer rounded ${
                    notification.read ? '' : 'bg-black/5 dark:bg-white/20}'
                }`}
            >
                {user && <img src={user.avatar ?? '/user.png'} alt="" className="rounded-full w-12 h-12" />}
                <div>
                    <span className="line-clamp-3">{notification.content}</span>
                    <span className="text-blue-400 font-medium text-xs">
                        {timeAgoFromPast(new Date(notification.createdAt))}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full">
            <h5 className="text-xl font-bold">Notifications</h5>
            <div className="h-full scroll_thin scroll_thin  overflow-y-auto text-sm my-3">
                {notifications.length > 0 ? (
                    <div className="flex gap-4 flex-col pb-8">
                        {todayNotifications.length > 0 && (
                            <div className="">
                                <h5 className="text-lg font-semibold mb-1">New</h5>
                                <div className="flex-col flex gap-0.5">
                                    {todayNotifications.map((notification) => renderNotification(notification))}
                                </div>
                            </div>
                        )}
                        {otherNotifications.length > 0 && (
                            <div>
                                <h5 className="text-lg font-semibold mb-1">Before</h5>
                                <div className="flex flex-col gap-0.5">
                                    {otherNotifications.map((notification) => renderNotification(notification))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col text-center justify-center items-center mt-12 gap-4">
                        <span>Activity on your posts</span>
                        <span>When someone likes or comments on one of your posts, you&apos;ll see it here.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
