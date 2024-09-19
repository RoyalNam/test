'use client';
import React, { useEffect, useState } from 'react';
import { PostProps } from '@/types';
import PostTile from '@/components/post/PostTile';
import PostDetail from '@/components/post/PostDetail';
import postApi from '@/api/modules/post.api';
import { Oval } from 'react-loader-spinner';
import MainLayout from '../MainLayout';

const Explore = () => {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingPosts, setFetchingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState<PostProps | null>(null);
    useEffect(() => {
        getRandomPosts();
    }, []);

    const getRandomPosts = async () => {
        try {
            setLoading(false);
            if (fetchingPosts) return;

            setFetchingPosts(true);
            const newPosts = await postApi.getPosts();
            if (newPosts && newPosts.posts.length > 0) {
                setPosts((prevPosts) => [...prevPosts, ...newPosts.posts]);
            }
        } catch (err) {
            throw err;
        } finally {
            setFetchingPosts(false);
            setLoading(true);
        }
    };

    const updatePost = async (post: PostProps) => {
        setPosts((prev) =>
            prev.map((item) => {
                if (item.post._id === post.post._id) return post;
                else return item;
            }),
        );
        setSelectedPost(post);
    };

    return (
        <MainLayout>
            <div className="w-full grid grid-cols-3 gap-1">
                {posts.length > 0 ? (
                    posts.map((item, idx) => (
                        <div key={idx}>
                            <PostTile post={item.post} setSelectedPost={() => setSelectedPost(item)} />
                        </div>
                    ))
                ) : (
                    <div>No posts</div>
                )}
                {!loading && (
                    <div>
                        <Oval
                            visible={true}
                            height="50"
                            width="50"
                            color="#000"
                            ariaLabel="oval-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            secondaryColor="#ccc"
                        />
                    </div>
                )}
            </div>
            {selectedPost && (
                <PostDetail
                    updatePost={updatePost}
                    postData={selectedPost}
                    closePostDetail={() => setSelectedPost(null)}
                />
            )}
        </MainLayout>
    );
};

export default Explore;
