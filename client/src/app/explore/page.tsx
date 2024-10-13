'use client';
import React, { useEffect, useState } from 'react';
import { Oval } from 'react-loader-spinner';

import { Post } from '@/types';
import PostTile from '@/components/post/PostTile';
import PostDetail from '@/components/post/PostDetail';
import MainLayout from '../MainLayout';
import { postApi } from '@/api/modules';

const Explore = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingPosts, setFetchingPosts] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    useEffect(() => {
        getRandomPosts();
    }, []);

    const getRandomPosts = async () => {
        try {
            setLoading(false);
            if (fetchingPosts) return;

            setFetchingPosts(true);
            const previousPostIds = posts.map((post) => post._id);
            const newPosts = await postApi.getPosts(previousPostIds);
            if (newPosts && newPosts.length > 0) {
                setPosts((prevPosts) => [...prevPosts, ...newPosts]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFetchingPosts(false);
            setLoading(true);
        }
    };

    const updatePost = async (post: Post) => {
        setPosts((prev) => prev.map((item) => (item._id === post._id ? post : item)));
    };

    return (
        <MainLayout fetchData={getRandomPosts}>
            <div className="w-full grid grid-cols-3 gap-1">
                {posts.length > 0 ? (
                    posts.map((item, idx) => (
                        <div key={idx}>
                            <PostTile post={item} setSelectedPost={() => setSelectedPost(item)} />
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
