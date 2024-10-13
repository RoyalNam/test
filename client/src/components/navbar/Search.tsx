'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BsSearch, BsXLg } from 'react-icons/bs';

import { User } from '@/types';
import { formatNumber } from '@/utils';
import { userApi } from '@/api/modules';

const Search: React.FC = () => {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState('');
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);
    const [foundUsers, setFoundUsers] = useState<User[]>([]);

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

    return (
        <div className="flex flex-col h-full scroll_thin overflow-y-auto">
            <div className="border-b border-black/30 dark:border-white/20">
                <h5 className="text-xl">Search</h5>
                <div className="flex items-center gap-2 pl-4 pr-2 border shadow  my-6 rounded-xl">
                    <button title="Search">
                        <BsSearch />
                    </button>
                    <input
                        title="Search"
                        type="search"
                        name=""
                        id=""
                        placeholder="Search"
                        className="flex-1 py-2 bg-transparent outline-none"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                {foundUsers.length == 0 && (
                    <div className="flex justify-between my-3 font-semibold">
                        <h5>Recent</h5>
                        <button className="text-blue-400 text-sm hover:text-current">Clear all</button>
                    </div>
                )}
                <div className="flex-1">
                    {foundUsers.length > 0 ? (
                        <div className="flex flex-col">
                            {foundUsers.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center py-2 px-3 rounded cursor-pointer gap-2 hover:bg-black/20 dark:hover:bg-white/15"
                                    onClick={() => router.push(`/profile/${item._id}`)}
                                >
                                    <img src={item.avatar ?? '/user.png'} alt="" className="w-12 h-12 rounded-full" />
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
                        <div className="h-full flex items-center justify-center">
                            <span>No recent searches.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Search;
