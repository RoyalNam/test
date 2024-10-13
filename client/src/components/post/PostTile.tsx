import React from 'react';
import { BsChatDotsFill, BsHeartFill } from 'react-icons/bs';

import { Post } from '@/types';
import { countComments, formatNumber } from '@/utils';

const PostTile = ({ post, setSelectedPost }: { post: Post; setSelectedPost: () => void }) => {
    return (
        <div className="relative group cursor-pointer text-white" onClick={setSelectedPost}>
            <img src={post.image_url} alt="" loading="lazy" className="aspect-square object-cover" />
            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center gap-3 bg-black/30 font-semibold">
                <div className="flex items-center gap-1">
                    <BsHeartFill />
                    <span>{formatNumber(post.likes.length)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <BsChatDotsFill />
                    <span>{formatNumber(countComments(post.comments))}</span>
                </div>
            </div>
        </div>
    );
};

export default PostTile;
