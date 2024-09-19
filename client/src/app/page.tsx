'use client';
import React, { useEffect, useState } from 'react';
import { PostProps } from '@/types';
import PostItem from '@/components/post/PostItem';
import SuggestedUsers from '@/components/SuggestedUsers';
import { Oval } from 'react-loader-spinner';
import postApi from '@/api/modules/post.api';
import MainLayout from './MainLayout';

const Home = () => {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingPosts, setFetchingPosts] = useState(false);

    useEffect(() => {
        getRandomPosts();
    }, []);

    const getRandomPosts = async () => {
        try {
            setLoading(false);
            if (fetchingPosts) return;

            setFetchingPosts(true);
            const newPosts = await postApi.getPosts();
            console.log('new post', newPosts.posts);

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
    };

    return (
        <MainLayout fetchData={getRandomPosts}>
            <div className="flex gap-2">
                <div className="max-w-[472px] w-full">
                    {posts.length > 0 ? (
                        posts.map((item, idx) => (
                            <div key={idx}>
                                <PostItem
                                    postData={{
                                        author: item.author,
                                        post: item.post,
                                    }}
                                    updatePost={updatePost}
                                />
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
                <div className="flex-1 hidden lg:block">
                    <SuggestedUsers />
                </div>
            </div>
        </MainLayout>
    );
};

export default Home;
