'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    BsBookmark,
    BsBookmarkFill,
    BsCamera,
    BsCameraFill,
    BsPersonWorkspace,
    BsPlus,
    BsTags,
    BsTagsFill,
    BsThreeDots,
    BsX,
} from 'react-icons/bs';

import PostDetail from '@/components/post/PostDetail';
import CreatePost from '@/components/post/CreatePost';
import { useAuthContextProvider } from '@/context/authUserContext';
import { MinimalUser, Post, User } from '@/types';
import PostTile from '@/components/post/PostTile';
import UserListModal from '@/components/UserListModal';
import MainLayout from '@/app/MainLayout';
import { followApi, postApi, userApi } from '@/api/modules';

interface TabProps {
    icon: React.ReactNode;
    tit: string;
    actIcon: React.ReactNode;
}

const Profile = () => {
    const router = useRouter();
    const { userId } = useParams();
    const { authUser, updateAuthUser } = useAuthContextProvider();
    const [tab, setTab] = useState('Posts');
    const [isShowCreatePost, setShowCreatePost] = useState(false);
    const [user, setUser] = useState<User | null>();
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [savePosts, setSavePosts] = useState<Post[]>([]);
    const [usersFollowing, setUsersFollowing] = useState<MinimalUser[]>([]);
    const [usersFollower, setUsersFollower] = useState<MinimalUser[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedUser =
                    authUser && userId === authUser._id
                        ? authUser
                        : ((await userApi.getUserById(userId as string)) as User);

                if (fetchedUser) {
                    setUser(fetchedUser);

                    if (fetchedUser.posts.length > 0) {
                        const postPromises = fetchedUser.posts.map((postId) => postApi.getPostById(postId));
                        const posts = await Promise.all(postPromises);

                        setPosts(posts);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId, authUser]);

    useEffect(() => {
        if (tab === 'Saved' || tab == 'Tagged') {
            fetchSavePost();
        }
    }, [tab, posts]);

    const fetchUsersFollower = async () => {
        try {
            if (user) {
                const userData = await userApi.getBasicInfoByIds(user.followers);

                if (userData && userData.length > 0) {
                    setUsersFollower(userData.filter((user) => user !== null) as MinimalUser[]);
                }
            }
        } catch (error) {
            throw error;
        }
    };

    const fetchUsersFollowing = async () => {
        if (user) {
            const userData = await userApi.getBasicInfoByIds(user.following);

            if (userData && userData.length > 0) {
                setUsersFollowing(userData.filter((user) => user !== null) as MinimalUser[]);
            }
        }
    };

    const fetchSavePost = async () => {
        try {
            if (authUser) {
                if (authUser.save_post.length > 0) {
                    const promises = authUser.save_post.map(async (item) => {
                        const postData = await postApi.getPostById(item);
                        return postData;
                    });
                    const savePostsData = await Promise.all(promises);
                    setSavePosts(savePostsData);
                } else setSavePosts([]);
            }
        } catch (error) {
            throw error;
        }
    };

    const updatePost = async (post: Post) => {
        setPosts((prev) =>
            prev.map((item) => {
                if (item._id === post._id) return post;
                else return item;
            }),
        );
        setSelectedPost(post);
    };

    const handleFollowing = async () => {
        try {
            if (authUser) {
                let following;

                if (authUser?.following.includes(userId as string))
                    following = await followApi.unFollower({ authId: authUser._id, userId: userId as string });
                else following = await followApi.followUser({ authId: authUser._id, userId: userId as string });
                const updatedUser = { ...authUser };

                if (following.isFollowing) {
                    updatedUser.following.push(userId as string);
                } else {
                    updatedUser.following = updatedUser.following.filter((id) => id !== (userId as string));
                }
                updateAuthUser(updatedUser);
            }
        } catch (err) {
            throw err;
        }
    };
    const renderTap = (tabItem: TabProps) => (
        <button
            key={tabItem.tit}
            className={`flex items-center gap-1 px-4 py-3 relative z-10 cursor-pointer ${
                tab == tabItem.tit ? 'font-bold' : ''
            }`}
            onClick={() => setTab(tabItem.tit)}
        >
            <span className="text-2xl">{tab == tabItem.tit ? tabItem.actIcon : tabItem.icon}</span>
            <span>{tabItem.tit}</span>
            {tab == tabItem.tit && <span className="absolute inset-x-0 h-[1px] rounded-full top-0 bg-red-50"></span>}
        </button>
    );

    const renderInfo = (tit: string, count: number, onClick?: () => {}) => (
        <li key={tit} className="inline-flex gap-1" onClick={onClick}>
            <span className="font-semibold cursor-pointer hover:underline">{count}</span>
            <span>{tit}</span>
        </li>
    );

    const TABS = [
        {
            icon: <BsCamera />,
            tit: 'Posts',
            actIcon: <BsCameraFill />,
        },
        {
            icon: <BsTags />,
            tit: 'Tagged',
            actIcon: <BsTagsFill />,
        },
        {
            icon: <BsBookmark />,
            tit: 'Saved',
            actIcon: <BsBookmarkFill />,
        },
    ];

    const renderEmptyInfoTab = (icon: React.ReactNode, tit: string, desc: string, onclick: () => void = () => {}) => (
        <div className="mx-12 mt-12">
            <div className="flex gap-4 flex-col items-center max-w-[380px] mx-auto">
                <div
                    className="text-4xl cursor-pointer rounded-full border p-4 border-current text-black/30 dark:text-white/30"
                    onClick={onclick}
                >
                    {icon}
                </div>
                <h5 className="text-3xl font-black">{tit}</h5>
                <span className="text-center text-sm">{desc}</span>
            </div>
        </div>
    );
    const handleCreate = () => setShowCreatePost(true);
    return !loading ? (
        <MainLayout>
            {user ? (
                <div>
                    <div className="flex gap-8 border-b border-white/20 flex-col md:flex-row">
                        <img
                            src={user.avatar ?? '/user.png'}
                            alt=""
                            className="hidden md:block w-36 h-36 rounded-full"
                        />
                        <div className="flex-1">
                            <div>
                                <div className="flex gap-3 justify-between">
                                    <div className="flex gap-3">
                                        <img
                                            src={user.avatar ?? '/user.png'}
                                            alt=""
                                            className="block md:hidden w-12 h-12 rounded-full"
                                        />
                                        <h5 className="font-semibold text-lg">{user.name}</h5>
                                    </div>
                                    {userId != authUser?._id ? (
                                        <div className="flex gap-4 items-center text-sm">
                                            <button
                                                className="bg-white text-pink-500 px-5 py-2 w-[104px] font-semibold rounded-md"
                                                onClick={handleFollowing}
                                            >
                                                {authUser?.following.includes(userId as string)
                                                    ? 'Following'
                                                    : 'Follow'}
                                            </button>
                                            <button
                                                onClick={() => router.push(`/messages/${userId}`)}
                                                className="bg-pink-500 px-5 py-2 font-semibold rounded-md"
                                            >
                                                Message
                                            </button>
                                            <button title="More" className="p-2 rounded-md bg-slate-400">
                                                <BsThreeDots />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            className="px-4 py-1 bg-black/10 dark:bg-white/25 opacity-85 font-semibold hover:opacity-100 rounded-full"
                                            onClick={() => router.push('/profile/edit')}
                                        >
                                            Edit profile
                                        </button>
                                    )}
                                </div>
                                <pre className="text-sm my-1">{user.bio}</pre>
                            </div>
                            <ul className="flex gap-6 md:justify-start justify-around my-4">
                                {renderInfo('posts', user.posts.length)}
                                {renderInfo('following', user.following.length, fetchUsersFollowing)}
                                {renderInfo('follower', user.followers.length, fetchUsersFollower)}
                            </ul>
                            {userId === authUser?._id && (
                                <div className="flex mb-8">
                                    <div
                                        className="text-center flex flex-col gap-1 cursor-pointer"
                                        onClick={handleCreate}
                                    >
                                        <span className="p-1 border rounded-full text-black/50 dark:text-white/30">
                                            <BsPlus className="text-5xl" />
                                        </span>
                                        <span className="text-sm font-semibold">New</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-center">
                            <div className="flex justify-center">
                                {TABS.map((item) =>
                                    item.tit === 'Saved' ? (
                                        userId === authUser?._id ? (
                                            <React.Fragment key={item.tit}>{renderTap(item)}</React.Fragment>
                                        ) : null
                                    ) : (
                                        <React.Fragment key={item.tit}>{renderTap(item)}</React.Fragment>
                                    ),
                                )}
                            </div>
                        </div>
                        {tab == 'Posts' &&
                            (posts.length === 0 ? (
                                <div className="text-center mb-8">
                                    {renderEmptyInfoTab(
                                        <BsCamera />,
                                        'Share photos',
                                        'When you share photos, they will appear on your profile.',
                                        handleCreate,
                                    )}
                                    <button className="text-blue-400 mt-4" onClick={handleCreate}>
                                        Share your first photo
                                    </button>
                                </div>
                            ) : (
                                <div className="">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                                        {posts.map((item) => (
                                            <PostTile
                                                key={item._id}
                                                post={item}
                                                setSelectedPost={() => setSelectedPost(item)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        {/* {tab == 'Tagged' &&
                            (savePosts.length === 0 ? (
                                <div className="text-center mb-8">
                                    {renderEmptyInfoTab(
                                        <BsPersonWorkspace />,
                                        'Photos of you',
                                        "When people tag you in photos, they'll appear here.",
                                    )}
                                </div>
                            ) : (
                                <div className="">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                                        {savePosts.map((item) => (
                                            <PostTile
                                                key={item.post._id}
                                                post={item.post}
                                                setSelectedPost={() => setSelectedPost(item.post)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>hello</div>
                            ))} */}
                        {tab == 'Saved' &&
                            (savePosts.length === 0 ? (
                                <div className="text-center mb-8">
                                    {renderEmptyInfoTab(
                                        <BsBookmark />,
                                        'Save',
                                        "Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.",
                                    )}
                                </div>
                            ) : (
                                <div className="">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
                                        {savePosts.map((item) => (
                                            <PostTile
                                                key={item._id}
                                                post={item}
                                                setSelectedPost={() => setSelectedPost(item)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                    {selectedPost && (
                        <PostDetail
                            updatePost={updatePost}
                            postData={selectedPost}
                            closePostDetail={() => setSelectedPost(null)}
                        />
                    )}
                    <UserListModal title="Followers" users={usersFollower} onClose={() => setUsersFollower([])} />
                    <UserListModal title="Followings" users={usersFollowing} onClose={() => setUsersFollowing([])} />

                    <CreatePost show={isShowCreatePost} onClose={() => setShowCreatePost(false)} />
                </div>
            ) : (
                <div className="text-red-500 text-xl">User not found</div>
            )}
        </MainLayout>
    ) : null;
};

export default Profile;
