'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthContextProvider } from '@/context/authUserContext';
import { MinimalUser } from '@/types';
import { followApi, userApi } from '@/api/modules';

const SuggestedUsers = () => {
    const router = useRouter();
    const { authUser, updateAuthUser } = useAuthContextProvider();
    const [suggestedUsers, setSuggestedUsers] = useState<MinimalUser[]>([]);
    const [isFetch, setFetch] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (authUser && isFetch) {
                    const suggestedUsers = await userApi.getSuggestedUsers(authUser._id);
                    console.log('suggested', suggestedUsers);
                    setSuggestedUsers(suggestedUsers);
                }
            } catch (error) {
                throw error;
            } finally {
                setFetch(false);
            }
        };
        if (authUser) fetchData();
    }, [authUser]);

    const handleFollowing = async (author: MinimalUser) => {
        try {
            if (authUser) {
                const following = authUser.following.includes(author._id)
                    ? await followApi.unFollower({ authId: authUser._id, userId: author._id })
                    : await followApi.followUser({ authId: authUser._id, userId: author._id });

                const updatedUser = { ...authUser };
                if (following.isFollowing) {
                    updatedUser.following.push(author._id);
                } else {
                    updatedUser.following = updatedUser.following.filter((id) => id !== author._id);
                }
                updateAuthUser(updatedUser);
            }
        } catch (err) {
            throw err;
        }
    };

    return (
        authUser && (
            <div className="">
                <h5 className="font-semibold text-xl mb-4">Suggested</h5>
                <div className="flex flex-col">
                    {suggestedUsers.length > 0 ? (
                        suggestedUsers.map((item) => (
                            <div
                                key={item._id}
                                className="flex justify-between px-4 py-2 rounded items-center hover:bg-white/15 cursor-pointer"
                                onClick={() => router.push(`/profile/${item._id}`)}
                            >
                                <div className="flex flex-1 items-center gap-2">
                                    <img
                                        src={item.avatar ?? '/user.png'}
                                        alt=""
                                        className="w-12 block rounded-full h-12"
                                    />
                                    <h5>{item.name}</h5>
                                </div>
                                <div>
                                    <button
                                        className={`${
                                            authUser.following.includes(item._id) && 'text-red-400'
                                        } px-4 py-1 rounded-full font-semibold opacity-85 min-w-[105px] hover:opacity-100 bg-black/20 dark:bg-white/15`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFollowing(item);
                                        }}
                                    >
                                        {authUser.following.includes(item._id) ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No user suggested.</div>
                    )}
                </div>
            </div>
        )
    );
};

export default SuggestedUsers;
