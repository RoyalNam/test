'use client';
import React, { useRef, useState } from 'react';
import { BsArrowLeft, BsImages, BsX } from 'react-icons/bs';
import { Oval } from 'react-loader-spinner';

import { useAuthContextProvider } from '@/context/authUserContext';
import Modal from '../Modal';
import { applyFilters, resizeImage } from '@/utils';
import { otherApi, postApi } from '@/api/modules';

interface RangeProps {
    tit: string;
    val: number;
}

const CreatePost = ({ show, onClose }: { show: boolean; onClose: () => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const captionRef = useRef<HTMLTextAreaElement>(null);
    const { authUser, updateAuthUser } = useAuthContextProvider();
    const [step, setStep] = useState<string[]>([]);
    const [stepsReverse, setStepsReverse] = useState(['caption', 'edit', 'upload_file']);
    const [isDiscard, setDiscard] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isPostCreated, setIsPostCreated] = useState(true);

    const initialFilters = {
        brightness: 50,
        contrast: 50,
        saturate: 50,
        hue_rotate: 50,
        sepia: 0,
    };
    const [filters, setFilters] = useState(initialFilters);
    const FILTERS = [
        { tit: 'brightness', val: filters.brightness },
        { tit: 'contrast', val: filters.contrast },
        { tit: 'saturate', val: filters.saturate },
        { tit: 'hue rotate', val: filters.hue_rotate },
        { tit: 'sepia', val: filters.sepia },
    ];

    const handleIconClick = () => {
        if (!imageUrl && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                if (e.target) {
                    const imageStr = e.target.result as string;
                    const image = new Image();
                    image.onload = () => {
                        try {
                            const canvas = resizeImage(image);
                            const resizedImageStr = canvas.toDataURL('image/jpeg', 0.7);
                            setImageUrl(resizedImageStr);
                            const newStep = stepsReverse.pop();
                            if (newStep) setStep([newStep]);
                        } catch (error) {
                            console.error('Error while resizing image:', error);
                        }
                    };
                    image.src = imageStr;
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleCreatePost = async () => {
        if (imageUrl) {
            try {
                setIsPostCreated(false);
                const filteredImageUrl = await applyFilters(imageUrl, filters);
                const formData = new FormData();
                const response = await fetch(filteredImageUrl);
                const blob = await response.blob();
                formData.append('filename', blob);
                const uploadResponse = await otherApi.uploadImage({ formData: formData });

                const post = await postApi.createPost({
                    image_url: uploadResponse.downloadURL,
                    caption: captionRef.current?.value,
                });
                if (post && authUser) {
                    const updatedUser = { ...authUser };
                    updatedUser.posts = [post._id, ...authUser.posts];
                    updateAuthUser(updatedUser);

                    handleResetDefaults();
                }
            } catch (error) {
                console.error('Error creating post:', error);
            } finally {
                setIsPostCreated(true);
            }
        }
    };

    const handleBack = () => {
        if (step[step.length - 1] === 'upload_file') setDiscard(true);
        else {
            const backStep = step.pop();
            setStep([...step]);
            stepsReverse.push(backStep || '');
        }
    };

    const handleNext = () => {
        const stepEnd = step[step.length - 1];
        if (stepEnd === 'caption') handleCreatePost();
        else {
            const newSteps = [...step, stepsReverse.pop() || ''];
            setStep(newSteps);
        }
    };

    const handleResetSteps = () => {
        setFilters(initialFilters);
        const steps = step.reverse();
        setStepsReverse((prevStepsReverse) => [...prevStepsReverse, ...steps]);
        setStep([]);
        setImageUrl('');
    };
    const handleResetDefaults = () => {
        handleResetSteps();
        onClose();
    };
    const handleDiscardCreate = () => {
        setDiscard(false);
        handleResetDefaults();
    };

    const renderRange = ({ item }: { item: RangeProps }) => (
        <div key={item.tit} className="">
            <span className="capitalize font-extralight">{item.tit}</span>
            <input
                title={item.tit}
                type="range"
                name=""
                id=""
                className="w-full custom-range"
                max={100}
                min={0}
                value={item.val}
                onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [item.tit.split(' ').join('_')]: Number(e.target.value) }))
                }
            />
        </div>
    );

    const stepsHandler = step.length > 1 && (
        <div className="w-full md:w-[300px]">
            {step[step.length - 1] === 'edit' && (
                <div className="p-4">
                    <strong className="py-2 block text-center text-xl">Filters</strong>
                    <div className="h-full flex gap-8 flex-col border-t py-6">
                        {FILTERS.map((item) => renderRange({ item: item }))}
                    </div>
                </div>
            )}
            {step[step.length - 1] === 'caption' && (
                <div className="p-3 bg-black/10 dark:bg-[#334155]">
                    <textarea
                        ref={captionRef}
                        name=""
                        id=""
                        className="w-full min-h-[180px] max-h-[300px] bg-transparent outline-none"
                        placeholder="Write a caption..."
                    ></textarea>
                </div>
            )}
        </div>
    );

    return (
        <>
            <Modal
                show={show}
                onClose={() => {
                    imageUrl ? setDiscard(true) : onClose();
                }}
            >
                <div
                    className={`${
                        step.length > 1 ? 'w-full' : 'w-[615px]'
                    } max-w-[945px] m-4 z-40 bg-white dark:bg-primary flex flex-col rounded-xl overflow-hidden`}
                >
                    <div className="border-b border-black/30 dark:border-white/20 py-2 text-center flex justify-between px-4">
                        {imageUrl && (
                            <button title="Back" className="text-blue-400" onClick={handleBack}>
                                <BsArrowLeft className="text-xl" />
                            </button>
                        )}
                        {step.length < 2 ? (
                            <h5 className="flex-1 font-semibold">Upload Photo</h5>
                        ) : (
                            <h5 className="flex-1 font-semibold">
                                {step[step.length - 1] === 'edit' ? 'Edit' : 'Permission'}
                            </h5>
                        )}
                        {imageUrl && (
                            <button className="text-blue-400" onClick={handleNext}>
                                {step[step.length - 1] === 'caption' ? 'Share' : 'Next'}
                            </button>
                        )}
                    </div>
                    <div className="h-[640px]">
                        {imageUrl ? (
                            <div className="h-full flex flex-col md:flex-row">
                                <div className="flex-1 flex justify-center items-center relative border-r border-black/30 dark:border-white/20">
                                    <img
                                        src={imageUrl}
                                        alt=""
                                        loading="lazy"
                                        style={{
                                            filter: `brightness(${filters.brightness / 100 + 0.5}) contrast(${
                                                filters.contrast / 100 + 0.5
                                            }) saturate(${filters.saturate + 50}%) hue-rotate(${
                                                (filters.hue_rotate - 50) * 3.6
                                            }deg) sepia(${filters.sepia}%)`,
                                        }}
                                        className="max-w-full max-h-full"
                                    />
                                    <span
                                        className="absolute right-3 top-3 p-1 rounded-full bg-black/75 cursor-pointer"
                                        onClick={handleResetSteps}
                                    >
                                        <BsX className="text-2xl text-white" />
                                    </span>
                                </div>
                                {stepsHandler}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div
                                    onClick={handleIconClick}
                                    className="text-center flex items-center flex-col py-4 cursor-pointer"
                                >
                                    <BsImages className="text-4xl" />
                                    <button className="mt-8">Select from computer</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <input
                    type="file"
                    title="Media"
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />
            </Modal>
            <Modal show={isDiscard} onClose={() => setDiscard(false)}>
                <div className="z-50">
                    <div className="bg-white dark:bg-primary w-96 text-center text-sm p-4 flex flex-col gap-2 rounded-xl">
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
            <Modal show={!isPostCreated} onClose={() => {}}>
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
                    <span className="text-sm font-medium mt-2">Creating post...</span>
                </div>
            </Modal>
        </>
    );
};
export default CreatePost;
