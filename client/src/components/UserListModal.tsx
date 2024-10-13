import React from 'react';
import { useRouter } from 'next/navigation';
import { BsX } from 'react-icons/bs';

import Modal from './Modal';
import { MinimalUser } from '@/types';

interface UserListModalProps {
    title: string;
    users: MinimalUser[];
    onClose: () => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ title, users, onClose }) => {
    const router = useRouter();
    return (
        <Modal show={users.length > 0} onClose={onClose}>
            <div className="w-96 z-50 bg-white dark:bg-primary rounded-xl overflow-hidden">
                <div className="relative text-center font-semibold py-2 border-b">
                    <h5>{title}</h5>
                    <button
                        title="close"
                        className="absolute cursor-pointer hover:bg-black/10 dark:bg-white/20 rounded-full right-2 top-1/2 -translate-y-1/2 text-4xl"
                        onClick={onClose}
                    >
                        <BsX />
                    </button>
                </div>
                <div className="flex flex-col h-80 overflow-y-scroll scroll_thin">
                    {users &&
                        users.map((item) => (
                            <div
                                key={item._id}
                                className="flex gap-2 items-center py-2 px-2 hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer"
                                onClick={() => router.push(`/profile/${item._id}`)}
                            >
                                <img
                                    src={item.avatar ?? '/user.png'}
                                    alt=""
                                    className="w-8 h-8 rounded-full line-clamp-1"
                                />
                                <span className="font-semibold">{item.name}</span>
                            </div>
                        ))}
                </div>
            </div>
        </Modal>
    );
};

export default UserListModal;
