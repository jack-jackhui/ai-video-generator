// faceSwap/page.js
"use client";
import React, {Suspense, useEffect, useState} from 'react';
import { useAuth } from "../context/AuthContext";
import FaceSwapLayout from './faceSwapLayouts';

import {Button, Card, CardBody, CardFooter, CardHeader,
    Image, Link, Input,
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, CircularProgress
} from "@nextui-org/react";

export default function FaceSwap() {
    const apiUrl = process.env.NEXT_PUBLIC_FACE_SWAP_API_URL;
    const backdrop = "blur";
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [activeCardKey, setActiveCardKey] = useState(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const [downloadUrl, setDownloadUrl] = useState("");
    const target_files = {
        '1': 'gatsby_short.mp4',
        '2': 'ironman.mp4',
        '3': 'zhenhuan.mp4',
        '4': 'Chowyunfat_A_better_tomorrow.mp4',
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (taskId) {
                checkTaskStatus();
            }
        }, 120000);  // Poll every 2 minutes

        return () => clearInterval(interval);
    }, [taskId]);

    const checkTaskStatus = async () => {
        try {
            const response = await fetch(`${apiUrl}/task-status/${taskId}`);
            const data = await response.json();
            if (response.ok && data.status !== 'In progress') {
                //console.log(data.status);
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                setDownloadUrl(`${apiUrl}/downloads/${taskId}/${target_files[activeCardKey]}`);
                setTaskId(null);  // Reset task ID after completion
            }
        } catch (error) {
            console.error('Error checking task status:', error);
            setIsLoading(false);
        }
    };
    const toggleUploadModal = (key) => {
        if (!isAuthenticated) {
            setShowLoginModal(true); // Trigger login modal if not authenticated
            return; // Stop the function from proceeding further
        }
        setActiveCardKey(key);
        setShowUploadModal(!showUploadModal); // Toggle the state to show or hide the modal
        if (!showUploadModal) {
            setImageSrc(null);  // Clear the image source when closing the modal
            setTaskId(null);
            setFeedbackMessage("");
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);  // Save the selected file into the state
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result); // Set the image source to the data URL
            };
            reader.readAsDataURL(file);
        }
    };

    const performSwap = async () => {
        if (!imageSrc) {
            setFeedbackMessage("Please upload a file first.");
            return;
        }

        const token = localStorage.getItem('authToken'); // Retrieve the token from local storage

        if (!token) {
            setFeedbackMessage("You must be logged in to perform this action.");
            return;
        }

        const formData = new FormData();
        formData.append('source', file);


        try {
            setIsLoading(true);
            setImageSrc(null);
            const targetUrl = `${apiUrl}/swap-face/?target_key=${activeCardKey}`;
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                },
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                setFeedbackMessage(data.message);  // Show success message or handle accordingly
                setTaskId(data.task_id);  // Assume API returns a task_id
            } else {
                throw new Error(data.message);
            }

        } catch (error) {
            console.error('Error during face swap:', error);
            setFeedbackMessage('Failed to swap face.');
            setIsLoading(false);
        }
    };

    return (
        <>
            <FaceSwapLayout>
                <div className="mt-12 mx-auto px-8 pb-8 grid grid-cols-2 md:grid-cols-3 gap-8">

                    <Card key={1} isHoverable isPressable isFooterBlurred className="max-w-xl mx-auto border-none">
                            <CardHeader className="flex-col">
                                <p className="text-tiny text-white/60 uppercase font-bold">The Great Gatsby</p>
                                <h4 className="text-white/90 font-medium text-xl">Leonardo Dicaprio</h4>
                            </CardHeader>
                            <Suspense fallback={<div>Loading...</div>}>
                                <CardBody>
                                    <iframe
                                        className="w-full h-48 md:h-[300px]"
                                        src={`https://youtube.com/embed/OxDymbIwHxk?feature=shared`}
                                        title="Leonardo Dicaprio - The Great Gatsby"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                        allowFullScreen
                                    ></iframe>
                                </CardBody>
                            </Suspense>
                            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                                <div className="flex flex-grow gap-2 items-center">
                                    <Image
                                        alt="Breathing app icon"
                                        className="rounded-full w-10 h-11 bg-black"
                                        src="/images/breathing-app-icon.jpeg"
                                    />
                                    <div className="flex flex-col">
                                        <p className="text-tiny text-white/60"></p>
                                        <p className="text-tiny text-white/60"></p>
                                    </div>
                                </div>
                                <Button color="danger" variant="bordered"
                                        showAnchorIcon as={Link} radius="full"
                                        size="sm" onPress={() =>toggleUploadModal(1)}>
                                    Face Swap
                                </Button>
                            </CardFooter>
                        </Card>
                    <Card key={2} isHoverable isPressable isFooterBlurred className="max-w-xl mx-auto border-none">
                        <CardHeader className="flex-col">
                            <p className="text-tiny text-white/60 uppercase font-bold">Robert Downey Jr</p>
                            <h4 className="text-white/90 font-medium text-xl">Iron Man</h4>
                        </CardHeader>
                        <Suspense fallback={<div>Loading...</div>}>
                            <CardBody>
                                <iframe
                                    className="w-full h-48 md:h-[300px]"
                                    src={`https://youtube.com/embed/8PFs8IZVs3I?feature=shared`}
                                    title="Robert Downey Jr - Iron Man"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                    allowFullScreen
                                ></iframe>
                            </CardBody>
                        </Suspense>
                        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                            <div className="flex flex-grow gap-2 items-center">
                                <Image
                                    alt="Breathing app icon"
                                    className="rounded-full w-10 h-11 bg-black"
                                    src="/images/breathing-app-icon.jpeg"
                                />
                                <div className="flex flex-col">
                                    <p className="text-tiny text-white/60"></p>
                                    <p className="text-tiny text-white/60"></p>
                                </div>
                            </div>
                            <Button color="danger" variant="bordered"
                                    showAnchorIcon as={Link} radius="full"
                                    size="sm" onPress={() =>toggleUploadModal(2)}>
                                Face Swap
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card key={3} isHoverable isPressable isFooterBlurred className="max-w-xl mx-auto border-none">
                        <CardHeader className="flex-col">
                            <p className="text-tiny text-white/60 uppercase font-bold">Zhen Huan</p>
                            <h4 className="text-white/90 font-medium text-xl">Sun Li</h4>
                        </CardHeader>
                        <Suspense fallback={<div>Loading...</div>}>
                            <CardBody>
                                <iframe
                                    className="w-full h-48 md:h-[300px]"
                                    src={`https://youtube.com/embed/2Shfwpan81k?feature=shared`}
                                    title="Zhen Huan"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                    allowFullScreen
                                ></iframe>
                            </CardBody>
                        </Suspense>
                        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                            <div className="flex flex-grow gap-2 items-center">
                                <Image
                                    alt="Breathing app icon"
                                    className="rounded-full w-10 h-11 bg-black"
                                    src="/images/breathing-app-icon.jpeg"
                                />
                                <div className="flex flex-col">
                                    <p className="text-tiny text-white/60"></p>
                                    <p className="text-tiny text-white/60"></p>
                                </div>
                            </div>
                            <Button color="danger" variant="bordered"
                                    showAnchorIcon as={Link} radius="full"
                                    size="sm" onPress={() =>toggleUploadModal(3)}>
                                Face Swap
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card key={4} isHoverable isPressable isFooterBlurred className="max-w-xl mx-auto border-none">
                        <CardHeader className="flex-col">
                            <p className="text-tiny text-white/60 uppercase font-bold">A Better Tomorrow</p>
                            <h4 className="text-white/90 font-medium text-xl">Chow Yun Fat</h4>
                        </CardHeader>
                        <Suspense fallback={<div>Loading...</div>}>
                            <CardBody>
                                <iframe
                                    className="w-full h-48 md:h-[300px]"
                                    src={`https://youtube.com/embed/WjY9UoPCTdA?feature=shared`}
                                    title="Chow Yun Fat - A Better Tomorrow"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                                    allowFullScreen
                                ></iframe>
                            </CardBody>
                        </Suspense>
                        <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                            <div className="flex flex-grow gap-2 items-center">
                                <Image
                                    alt="Breathing app icon"
                                    className="rounded-full w-10 h-11 bg-black"
                                    src="/images/breathing-app-icon.jpeg"
                                />
                                <div className="flex flex-col">
                                    <p className="text-tiny text-white/60"></p>
                                    <p className="text-tiny text-white/60"></p>
                                </div>
                            </div>
                            <Button color="danger" variant="bordered"
                                    showAnchorIcon as={Link} radius="full"
                                    size="sm" onPress={() =>toggleUploadModal(4)}>
                                Face Swap
                            </Button>
                        </CardFooter>
                    </Card>



                </div>

                {/* Modal Popup*/}
                <Modal
                    backdrop={backdrop}
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    placement="top-center"
                    motionProps={{
                        variants: {
                            enter: {
                                y: 0,
                                opacity: 1,
                                transition: {
                                    duration: 0.3,
                                    ease: "easeOut",
                                },
                            },
                            exit: {
                                y: -20,
                                opacity: 0,
                                transition: {
                                    duration: 0.2,
                                    ease: "easeIn",
                                },
                            },
                        }
                    }}
                >
                    <ModalContent>
                                <ModalHeader className="flex flex-col gap-1">Upload</ModalHeader>
                                <ModalBody>
                                    <p className="mb-4 text-gray-600">Please upload a photo that you would like to use for the face swap.</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-violet-50 file:text-violet-700
                                       hover:file:bg-violet-100"
                                    />
                                    {imageSrc && (
                                        <div className="mt-4">
                                            <Image src={imageSrc} alt="Uploaded Image Preview" isBlurred />
                                        </div>
                                    )}
                                    <div className="mt-4 justify-center">
                                    {isLoading && <CircularProgress className="justify-center" color="danger" label="Loading..." size="md" />}
                                    </div>
                                    {feedbackMessage && <p>{feedbackMessage}</p>}
                                    {downloadUrl && <Link isBlock showAnchorIcon color="success" href={downloadUrl} target="_blank" onPress={() => { setShowUploadModal(false)}}>Download the video</Link>}
                                </ModalBody>
                                <ModalFooter className="justify-between">
                                    <Button color="danger" onPress={() => { setShowUploadModal(false);
                                        setImageSrc(null);
                                        setFeedbackMessage("");
                                    }}>
                                        Close
                                    </Button>
                                    {!isLoading && <Button color="warning" onPress={performSwap}>
                                        Swap Now
                                    </Button>}
                                </ModalFooter>
                    </ModalContent>
                </Modal>
            </FaceSwapLayout>

        </>
    )

}
