'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsArrowReturnRight, BsSend, BsX } from 'react-icons/bs';

import Modal from '../Modal';
import { Comment, MinimalUser, Post } from '@/types';
import { timeAgoFromPast } from '@/utils';
import PostItem from './PostItem';
import { useAuthContextProvider } from '@/context/authUserContext';
import { postApi, userApi } from '@/api/modules';

export interface PostDetailProps {
    postData: Post | null;
    updatePost: (post: Post) => void;
    closePostDetail: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ postData, updatePost, closePostDetail }) => {
    const { authUser } = useAuthContextProvider();
    const commentTxtRef = useRef<HTMLTextAreaElement | null>(null);
    const [isDiscard, setDiscard] = useState(false);

    useEffect(() => {}, [authUser, postData]);

    const handleCreateComment = async () => {
        if (authUser) {
            try {
                if (postData && commentTxtRef.current && commentTxtRef.current.value.trim() != '') {
                    const comment = await postApi.createComment({
                        postId: postData._id,
                        data: { comment_text: commentTxtRef.current?.value.toString(), userId: authUser._id },
                    });

                    if (comment) {
                        const updatedComments = [comment.comment, ...postData!.comments];
                        updatePost({ ...postData, comments: updatedComments });
                        commentTxtRef.current.value = '';
                    }
                }
            } catch (err) {
                throw err;
            }
        }
    };

    const handleDiscardCreate = () => {
        setDiscard(false);
        closePostDetail();
    };

    const handleClosePostDetail = () => {
        if (commentTxtRef.current?.value.trim() !== '') {
            setDiscard(true);
        } else {
            closePostDetail();
        }
    };

    const updateCommentsRecursively = (comments: Comment[], updatedComment: Comment, parentId: string): Comment[] => {
        return comments.map((prevComment) => {
            if (prevComment._id === parentId) {
                return { ...prevComment, replies: [...prevComment.replies, updatedComment] };
            } else if (prevComment.replies && prevComment.replies.length > 0) {
                const updatedReplies = updateCommentsRecursively(prevComment.replies, updatedComment, parentId);
                return { ...prevComment, replies: updatedReplies };
            } else {
                return prevComment;
            }
        });
    };

    const updateComments = (updatedComment: Comment, parentId: string) => {
        if (postData) {
            const updatedPost = {
                ...postData,
                comments: updateCommentsRecursively(postData.comments, updatedComment, parentId),
            };
            updatePost(updatedPost);
        }
    };

    return postData ? (
        <>
            <Modal show={true} onClose={handleClosePostDetail}>
                <div className="z-40 relative bg-white dark:bg-primary h-[calc(100vh-64px)] w-[calc(100vw-84px)] flex rounded-xl">
                    <div className="hidden md:flex flex-1 items-center border-r">
                        <img
                            src={postData.image_url}
                            alt=""
                            loading="lazy"
                            className="max-w-full max-h-full w-full h-auto object-cover"
                        />
                    </div>
                    <div className="w-full md:w-[400px] h-full pt-5 pb-3 px-4 flex flex-col">
                        <PostItem postData={postData} show={false} updatePost={updatePost} isShowImg={false} />
                        <div className="md:hidden flex items-center -mx-4">
                            <img
                                src={postData.image_url}
                                alt=""
                                loading="lazy"
                                className="max-w-full max-h-full w-full h-auto object-cover"
                            />
                        </div>
                        {postData.comments.length > 0 ? (
                            <div className="border-b text-sm border-black/30 dark:border-white/20 py-4 my-3 flex-1 scroll_thin overflow-y-auto">
                                <div className="flex flex-col ml-8">
                                    {postData.comments.map((item) => (
                                        <RenderComment
                                            key={item._id}
                                            postId={postData._id}
                                            commentId={item._id}
                                            comment={item}
                                            updateComments={updateComments}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <span className="flex-1">No comment</span>
                        )}
                        <div className="border rounded-xl -mx-2 inline-flex items-end border-black/30 dark:border-white/25">
                            <textarea
                                ref={commentTxtRef}
                                placeholder="Comments..."
                                className="w-full max-h-32 py-2 px-2 bg-transparent overflow-hidden outline-none"
                                onChange={(e) => {
                                    const textarea = e.target;
                                    if (textarea) {
                                        textarea.style.height = 'auto';
                                        textarea.style.height = textarea.scrollHeight + 'px';
                                    }
                                }}
                            ></textarea>
                            <button title="send" className="p-2" onClick={handleCreateComment}>
                                <BsSend className="text-xl" />
                            </button>
                        </div>
                    </div>
                    <button
                        title="Close"
                        className="text-xl absolute right-1 top-1 cursor-pointer bg-white/10 hover:bg-white/15 rounded-full"
                        onClick={handleClosePostDetail}
                    >
                        <BsX className="text-4xl" />
                    </button>
                </div>
            </Modal>
            <Modal show={isDiscard} onClose={() => setDiscard(false)}>
                <div className="z-50">
                    <div className="bg-primary w-96 text-center text-sm p-4 flex flex-col gap-2 rounded-xl">
                        <div className="py-4">
                            <h6 className="text-xl mb-1">Discard post?</h6>
                            <span>If you leave, your edits won&apos;t be saved.</span>
                        </div>
                        <button
                            className="text-red-500 py-3 border-y border-black/30 dark:border-white/20"
                            onClick={handleDiscardCreate}
                        >
                            Discard
                        </button>
                        <button className=" pt-1" onClick={() => setDiscard(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    ) : null;
};

export default PostDetail;

const RenderComment: React.FC<{
    comment: Comment;
    commentId: string;
    postId: string;
    updateComments: (updatedComment: Comment, parentId: string) => void;
}> = ({ comment, commentId, postId, updateComments }) => {
    const [showAllReplies, setShowAllReplies] = useState(false);
    const [userComment, setUserComment] = useState<MinimalUser | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (comment && comment.user_id) {
                const userComment = await userApi.getBasicInfoById(comment.user_id);
                if (userComment) setUserComment(userComment);
            }
        };

        fetchData();
    }, [comment]);

    return (
        <div>
            {userComment && (
                <RenderItem
                    user={userComment}
                    comment={comment}
                    commentId={commentId}
                    postId={postId}
                    isShowAll={showAllReplies}
                    setShowAll={() => setShowAllReplies(true)}
                    updateComments={updateComments}
                />
            )}
        </div>
    );
};

const RenderItem: React.FC<{
    user: MinimalUser;
    comment: Comment;
    postId: string;
    commentId: string;
    isShowAll: boolean;
    setShowAll: () => void;
    updateComments: (updatedComment: Comment, parentId: string) => void;
}> = ({ user, comment, commentId, postId, isShowAll, setShowAll, updateComments }) => {
    const router = useRouter();
    const { authUser } = useAuthContextProvider();
    const [isShow, setShow] = useState(false);
    const txtRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {}, [authUser]);
    useEffect(() => {}, [comment]);
    const handleReply = async () => {
        try {
            if (authUser) {
                if (comment && txtRef.current?.value.trim() != '') {
                    const resp = await postApi.replyComment({
                        postId: postId,
                        commentId: commentId,
                        data: {
                            parentId: commentId === comment._id ? '' : comment._id,
                            comment_text: txtRef.current?.value.toString(),
                            user: authUser._id,
                        },
                    });
                    if (resp) {
                        updateComments(resp.reply, comment._id);
                        setShow(false);
                    }
                }
            }
        } catch (err) {
            throw err;
        }
    };
    const redirectUserProfile = () => {
        router.push(`/profile/${user._id}`);
    };

    return (
        <>
            <div className={`flex gap-2 py-1 -ml-8`}>
                <img
                    src={user?.avatar ?? '/user.png'}
                    alt=""
                    className="w-8 min-w-8 h-8 object-cover rounded-full cursor-pointer"
                    onClick={redirectUserProfile}
                />
                <div className="flex-1">
                    <div className="dark:bg-white/20 bg-black/5 mr-1 inline-block rounded-2xl px-2 py-1">
                        <h4 className="font-semibold cursor-pointer hover:underline" onClick={redirectUserProfile}>
                            {user?.name}
                        </h4>
                        <p className="font-light">{comment.comment_text}</p>
                    </div>
                    <div className="ml-2 text-xs flex gap-3">
                        <span>{timeAgoFromPast(new Date(comment.updatedAt))}</span>
                        <button>like</button>
                        <button
                            onClick={() => {
                                setShow(true);
                                if (txtRef && txtRef.current) {
                                    txtRef.current.value = `@${user.name}`;
                                }
                            }}
                        >
                            reply
                        </button>
                    </div>
                    {isShow && (
                        <div className="w-full border rounded-xl inline-flex items-end border-black/30 dark:border-white/25">
                            <textarea
                                placeholder="Comments..."
                                className="w-full max-h-20 py-2 px-2 bg-transparent overflow-hidden outline-none"
                                ref={txtRef}
                                onChange={(e) => {
                                    const textarea = e.target;
                                    if (textarea) {
                                        textarea.style.height = 'auto';
                                        textarea.style.height = textarea.scrollHeight + 'px';
                                    }
                                }}
                            ></textarea>
                            <button title="send" className="p-2" onClick={handleReply}>
                                <BsSend className="text-xl" />
                            </button>
                        </div>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                        <div>
                            {isShowAll &&
                                comment.replies.map((reply) => (
                                    <RenderComment
                                        key={reply._id}
                                        postId={postId}
                                        commentId={commentId}
                                        comment={reply}
                                        updateComments={updateComments}
                                    />
                                ))}
                            {!isShowAll && comment.replies.length > 0 && (
                                <div className="inline-flex gap-1">
                                    <BsArrowReturnRight className="text-sm" />
                                    <button
                                        className="text-xs"
                                        onClick={setShowAll}
                                    >{`See all ${comment.replies.length} reply`}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
