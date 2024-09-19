import React from 'react';
import { BsChatDots } from 'react-icons/bs';

const MessageEmpty = () => {
    return (
        <div className="flex-1 flex h-full flex-col gap-2 justify-center items-center">
            <span className="p-5 border-2 rounded-full block mb-6">
                <BsChatDots className="text-5xl" />
            </span>
            <h5 className="font-semibold text-xl">Your messages</h5>
            <span className="font-extralight text-sm text-center">
                Private photos and messages to a friend or group.
            </span>
            <button
                className="bg-blue-500 text-white font-medium text-sm px-4 py-1 rounded-md mt-2"
                // onClick={() => setShowChatModel(true)}
            >
                Send message
            </button>
        </div>
    );
};

export default MessageEmpty;
