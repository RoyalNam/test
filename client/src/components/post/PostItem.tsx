import React, { useEffect, useState } from 'react';
import { BsBookmark, BsBookmarkFill, BsChat, BsHeart, BsHeartFill, BsSend, BsThreeDots } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { countComments, formatNumber } from '@/utils';
import { timeAgoFromPast } from '@/utils';
import Modal from '../Modal';
import { MinimalUser, PostProps } from '@/types';
import { useAuthContextProvider } from '@/context/authUserContext';
import PostDetail from './PostDetail';
import UserListModal from '../UserListModal';
import userApi from '@/api/modules/user.api';
import postApi from '@/api/modules/post.api';
import followApi from '@/api/modules/follow.api';

interface PostItemProps {
    postData: PostProps;
    isShowImg?: boolean;
    show?: boolean;
    updatePost: (post: PostProps) => void;
}

const PostItem: React.FC<PostItemProps> = ({ postData, isShowImg = true, show = true, updatePost }) => {
    const { authUser, updateAuthUser } = useAuthContextProvider();
    const { author, post } = postData;
    const router = useRouter();
    const [isShowMores, setShowMores] = useState(false);
    const [usersLike, setUsersLike] = useState<MinimalUser[]>([]);
    const [isShow, setShow] = useState(false);

    useEffect(() => {}, [authUser]);

    const handleLikePost = async () => {
        try {
            if (postData && authUser) {
                const userLikePost = await postApi.toggleLikePost({ userId: author._id, postId: post._id });
                const updatedPost = {
                    ...post,
                    likes: userLikePost.isLiked
                        ? [...post.likes, authUser._id]
                        : post.likes.filter((id) => id !== authUser._id),
                };
                updatePost({ ...postData, post: updatedPost });
            }
        } catch (err) {
            throw err;
        }
    };

    const handleFollowing = async () => {
        try {
            if (authUser) {
                let following;

                if (authUser?.following.includes(author._id))
                    following = await followApi.unFollower({ authId: authUser._id, userId: author._id });
                else following = await followApi.followUser({ authId: authUser._id, userId: author._id });
                const updatedUser = { ...authUser };

                if (following.isFollowing) {
                    updatedUser.following.push(author._id);
                } else {
                    updatedUser.following = updatedUser.following.filter((id) => id !== author._id);
                }
                updateAuthUser(updatedUser);
                setShowMores(false);
            }
        } catch (err) {
            throw err;
        }
    };

    const handleSavePost = async () => {
        try {
            if (authUser) {
                const isSave = await postApi.toggleSavePost({ userId: author._id, postId: post._id });
                const updatedUser = { ...authUser };

                if (isSave.saved) {
                    updatedUser.save_post.push({ user_id: author._id, post_id: post._id });
                } else {
                    updatedUser.save_post = updatedUser.save_post.filter(
                        (item) => item.user_id != author._id && item.post_id !== post._id,
                    );
                }

                updateAuthUser(updatedUser);
                setShowMores(false);
            }
        } catch (err) {
            throw err;
        }
    };

    const redirectUserProfile = () => router.push(`/profile/${author._id}`);

    const fetchUsersLike = async () => {
        const userData = await userApi.getBasicInfoByIds(post.likes);
        if (userData && userData.length > 0) {
            setUsersLike(userData.filter((user) => user !== null) as MinimalUser[]);
        }
    };

    const MORES = [
        {
            tit: authUser?.following.includes(author._id) ? 'UnFollow' : 'Follow',
            onclick: handleFollowing,
        },
        {
            tit: 'Go to post',
            onclick: () => {
                setShowMores(false);
                setShow(true);
            },
        },
        {
            tit: 'Save',
            onclick: () => {
                handleSavePost();
                setShowMores(false);
            },
        },
        {
            tit: 'About this account',
            onclick: () => {
                setShowMores(false);
                redirectUserProfile();
            },
        },
        {
            tit: 'Cancel',
            onclick: () => setShowMores(false),
        },
    ];

    const renderUserInfo = (
        <>
            <div className="flex justify-between items-center">
                <div className="flex items-start gap-2">
                    <img
                        src={author.avatar ?? '/user.png'}
                        alt=""
                        className="w-12 rounded-full h-12 cursor-pointer"
                        onClick={redirectUserProfile}
                    />
                    <div className="flex flex-col">
                        <div className="flex gap-4">
                            <h4 className="hover:underline cursor-pointer font-semibold" onClick={redirectUserProfile}>
                                {author.name}
                            </h4>
                            {authUser?._id != author._id && !authUser?.following.includes(author._id) && (
                                <button className="text-blue-400 relative font-medium" onClick={handleFollowing}>
                                    Follow
                                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"></span>
                                </button>
                            )}
                        </div>
                        <span className="text-xs leading-3 opacity-75">
                            {timeAgoFromPast(new Date(post.post_date))}
                        </span>
                    </div>
                </div>
                <button title="More" className="p-2" onClick={() => setShowMores(true)}>
                    <BsThreeDots className="text-xl" />
                </button>
            </div>
            <Modal show={isShowMores} onClose={() => setShowMores(false)}>
                <div className="text-center flex flex-col w-[400px] rounded-xl z-30 bg-white dark:bg-primary">
                    {MORES.map((item) =>
                        item.tit === 'Follow' && authUser?._id === author._id ? null : (
                            <button
                                onClick={item.onclick}
                                key={item.tit}
                                className={`${
                                    item.tit === 'UnFollow' ? 'text-red-500' : ''
                                } border-b border-black/300 dark:border-white/20 py-3 last:border-none`}
                            >
                                {item.tit}
                            </button>
                        ),
                    )}
                </div>
            </Modal>
        </>
    );

    return (
        post && (
            <>
                <div className="border-b border-black/30 dark:border-white/20 py-4">
                    <div>
                        {renderUserInfo}
                        {isShowImg && <img src={post.image_url} alt="" loading="lazy" className="w-full max-h my-2" />}
                        <pre className="text-wrap font-sans leading-5">{post.caption}</pre>
                        <div className="text-2xl flex justify-between mt-2">
                            <div className="flex gap-4">
                                <div className="flex gap-1">
                                    <button onClick={handleLikePost}>
                                        {authUser && postData.post.likes.includes(authUser._id) ? (
                                            <BsHeartFill className="text-red-600" />
                                        ) : (
                                            <BsHeart />
                                        )}
                                    </button>
                                    <span className="text-base hover:underline" onClick={fetchUsersLike}>
                                        {formatNumber(post.likes.length)}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button title="Comment" onClick={() => setShow(true)}>
                                        <BsChat />
                                    </button>
                                    <span className="text-base">{formatNumber(countComments(post.comments))}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                {/* <button title="Share">
                                    <BsSend />
                                </button> */}
                                <button title="Save" onClick={handleSavePost}>
                                    {authUser &&
                                    authUser.save_post.some(
                                        (item) =>
                                            item.post_id === postData.post._id && item.user_id === postData.author._id,
                                    ) ? (
                                        <BsBookmarkFill className="text-yellow-500" />
                                    ) : (
                                        <BsBookmark />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <UserListModal title="Likes" users={usersLike} onClose={() => setUsersLike([])} />
                {isShow && show && (
                    <PostDetail postData={postData} updatePost={updatePost} closePostDetail={() => setShow(false)} />
                )}
            </>
        )
    );
};

export default PostItem;
