'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Oval } from 'react-loader-spinner';
import { useAuthContextProvider } from '@/context/authUserContext';
import Modal from '@/components/Modal';
import userApi from '@/api/modules/user.api';
import otherApi from '@/api/modules/other.api';
import MainLayout from '@/app/MainLayout';

const EditProfile = () => {
    const router = useRouter();
    const { authUser, updateAuthUser } = useAuthContextProvider();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [updateProfile, setUpdateProfile] = useState({
        name: authUser?.name,
        avatar: authUser?.avatar,
        bio: authUser?.bio,
    });
    const [isUpdated, setIsUpdated] = useState(false);
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {}, [authUser]);

    const handleIconClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setUpdateProfile((prev) => ({
                ...prev,
                avatar: URL.createObjectURL(selectedFile),
            }));
        }
    };

    const handleSaveChange = async () => {
        try {
            setIsUpdated(true);
            if (!authUser || !updateProfile.name || updateProfile.name.length <= 8) return;
            let uploadResponse;
            if (
                updateProfile.avatar !== authUser.avatar ||
                updateProfile.name !== authUser.name ||
                updateProfile.bio !== authUser.bio
            ) {
                if (updateProfile.avatar !== authUser.avatar) {
                    const formData = new FormData();
                    const response = await fetch(updateProfile.avatar as string);
                    const blob = await response.blob();
                    formData.append('filename', blob);
                    uploadResponse = await otherApi.uploadImage({ formData: formData });
                }
                const avatarUrl = uploadResponse ? uploadResponse.downloadURL : updateProfile.avatar;
                const updated = await userApi.updateUser(authUser._id, {
                    ...updateProfile,
                    avatar: avatarUrl,
                });

                const updatedMinimal = {
                    avatar: avatarUrl,
                    name: updateProfile.name as string,
                    bio: updateProfile.bio as string,
                };
                updateAuthUser({
                    ...authUser,
                    ...updatedMinimal,
                });
                setUpdateProfile(updatedMinimal);
            }
        } catch (err) {
            throw err;
        } finally {
            setIsUpdated(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            if (authUser) {
                const isDelete = await userApi.deleteUser(authUser._id);
                if (isDelete.status == 200) router.push('/account/login');
            }
        } catch (error) {
            console.log('err', error);
        }
    };

    return (
        authUser && (
            <MainLayout>
                <div className="max-w-2xl">
                    <div className="flex justify-between items-center">
                        <img src={updateProfile.avatar ?? '/user.png'} alt="" className="w-52 h-52 rounded-full" />
                        <button
                            className="px-4 py-2 bg-blue-500 text-white opacity-85 hover:opacity-100 font-bold rounded-full"
                            onClick={handleIconClick}
                        >
                            Change
                        </button>
                        <input
                            type="file"
                            title="Media"
                            accept="image/*,video/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div className="mt-8">
                        <form action="post">
                            <span className="text-xl font-semibold">Name</span>
                            <textarea
                                name=""
                                id=""
                                title="Name"
                                rows={1}
                                placeholder="Name"
                                value={updateProfile.name}
                                onChange={(e) =>
                                    setUpdateProfile((prev) => ({ ...prev, name: e.target.value.toString() }))
                                }
                                className="w-full bg-transparent outline-none border rounded-md px-2 py-1"
                            ></textarea>
                        </form>
                    </div>
                    <div className="mt-8">
                        <form action="post">
                            <span className="text-xl font-semibold">Bio</span>
                            <textarea
                                name=""
                                id=""
                                title="Bio"
                                value={updateProfile.bio}
                                onChange={(e) =>
                                    setUpdateProfile((prev) => ({ ...prev, bio: e.target.value.toString() }))
                                }
                                placeholder="Bio"
                                className="w-full max-h-48 scroll_thin outline-none bg-transparent border rounded-md px-2 py-1"
                            ></textarea>
                        </form>
                    </div>
                    <div className="text-right mt-6">
                        <button
                            className={`bg-blue-500 text-white px-5 py-2 min-w-48 rounded-full text-xl font-semibold ${
                                updateProfile.avatar != authUser.avatar ||
                                updateProfile.name != authUser.name ||
                                updateProfile.bio != authUser.bio
                                    ? 'bg-blue-500'
                                    : 'bg-blue-500/50'
                            } `}
                            onClick={handleSaveChange}
                        >
                            Save
                        </button>
                    </div>
                </div>
                <button
                    className="text-red-500 font-bold mt-4 border rounded-full px-4 py-2 border-current hover:bg-red-500 hover:text-white"
                    onClick={() => setIsShow(true)}
                >
                    Delete Account
                </button>
                <Modal show={isShow} onClose={() => setIsShow(false)}>
                    <div className="z-40 bg-white dark:bg-primary p-4 rounded-xl max-w-md w-full text-center">
                        <p className="text-xl">Are you sure you want to delete your account?</p>
                        <div className="flex justify-around mt-8 text-xl">
                            <button
                                className="min-w-32 py-1 rounded-full font-bold bg-red-400 text-white"
                                onClick={handleDeleteAccount}
                            >
                                Yes
                            </button>
                            <button
                                className="min-w-32 py-1 rounded-full font-bold border"
                                onClick={() => setIsShow(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal show={isUpdated} onClose={() => {}}>
                    <div className="z-40 text-white flex flex-col items-center justify-center">
                        <Oval
                            visible={true}
                            height="50"
                            width="50"
                            color="#fff"
                            ariaLabel="oval-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                            secondaryColor="#ccc"
                        />
                        <span className="text-sm font-medium mt-2">Updating profile...</span>
                    </div>
                </Modal>
            </MainLayout>
        )
    );
};

export default EditProfile;
