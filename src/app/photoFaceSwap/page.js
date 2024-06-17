// faceSwap/photoFaceSwap.js
"use client";
import React, {Suspense, useEffect, useState} from 'react';
import { useAuth } from "../context/AuthContext";
import PhotoFaceSwapLayout from './photoFaceSwapLayouts';

import {Button, Card, CardBody, CardFooter, CardHeader,
    Image, Link, Input,
    Divider,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter, CircularProgress
} from "@nextui-org/react";
import toast from "react-hot-toast";

export default function Page() {
    const apiUrl = process.env.NEXT_PUBLIC_FACE_SWAP_API_URL;
    const backdrop = "blur";
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    //const [activeCardKey, setActiveCardKey] = useState(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const [downloadUrl, setDownloadUrl] = useState("");
    const [sourceImage, setSourceImage] = useState('/images/andy_lau.png');  // Default source image
    const [targetImage, setTargetImage] = useState('/images/Scarlett_Johansson.png');  // Default target image
    const [sourceFile, setSourceFile] = useState(null);
    const [targetFile, setTargetFile] = useState(null);

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
            if (response.ok && data.status !== 'In progress' && data.status !== 'Failed' ) {
                //console.log(data.status);
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                setDownloadUrl(`${apiUrl}/downloads/${taskId}/${targetFile.name}`);
                setTaskId(null);  // Reset task ID after completion
            } else if (data.status == 'Failed') {
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                toast.error("Swap Failed! Please try again.")
                setTaskId(null);
            }
        } catch (error) {
            console.error('Error checking task status:', error);
            setIsLoading(false);
            toast.error("Swap Failed! Please try again.")
        }
    };
    const toggleUploadModal = () => {
        setShowUploadModal(!showUploadModal); // Toggle the state to show or hide the modal
        if (!showUploadModal) {
            setImageSrc(null);  // Clear the image source when closing the modal
            setTaskId(null);
            setFeedbackMessage("");
        }
    };

    const handleSwapFaceClick = () => {
        if (!isAuthenticated) {
            setShowLoginModal(true); // Trigger login modal if not authenticated
        } else {
            toggleUploadModal(); // Show the upload modal if authenticated
        }
    };

    const handleImageChange = (event, imageType) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (imageType === 'source') {
                    setSourceImage(e.target.result);
                    setSourceFile(file);
                } else {
                    setTargetImage(e.target.result);
                    setTargetFile(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileInputClick = (imageType) => {
        document.getElementById(imageType).click();
    };

    const performSwap = async () => {
        // Ensure both images are selected
        if (!sourceFile || !targetFile) {
            setFeedbackMessage("Please upload both source and target files.");
            return;
        }

        const token = localStorage.getItem('authToken'); // Retrieve the token from local storage

        if (!token) {
            setFeedbackMessage("You must be logged in to perform this action.");
            return;
        }

        const formData = new FormData();
        formData.append('source', sourceFile);
        formData.append('target', targetFile);


        try {
            setIsLoading(true);
            setImageSrc(null);
            const targetUrl = `${apiUrl}/photo-swap-face/`;
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
            <PhotoFaceSwapLayout>
                <div className="flex justify-center items-center min-h-screen h-full ">
                    <div className="w-4/5 bg-gray-900 p-0 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 mt-0 md:mt-0 -mt-20">
                        {/* Left container for input images */}
                        <Card className="border-none p-0 m-0" radius="lg">
                            <CardBody className="flex flex-col items-center justify-center space-y-4 p-4">
                                <p>Upload Your Source and Target Images</p>
                                <div className="flex items-center justify-center space-x-4">
                                    <input type="file" id="source" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange(e, 'source')} />
                                <Image
                                    src={sourceImage}
                                    alt="Source Image"
                                    className="m-2 cursor-pointer"
                                    width={200}
                                    height={200}
                                    radius="full"
                                    onClick={() => handleFileInputClick('source')}
                                />
                                    <svg width="50px" height="30px" viewBox="0 0 183 91" style={{ margin: '0 15px' }} xmlns="http://www.w3.org/2000/svg">
                                        <g fill="#E8E8E8" fillRule="nonzero" transform="rotate(90 91.5 90)">
                                            <path d="M83.5954811,15.9744118 C68.0136231,7.36289104 49.892191,2.51320509 32.3498272,0.885232078 C22.7592447,-2.48173877e-15 9.03191924,-1.7925553 2.77949529,5.10350794 C-5.85354287,14.6317145 7.19252575,9.34840953 20.4391867,69.5149448 C21.6313861,74.9427894 31.153843,71.7705242 30.7488736,66.9132309 C29.9010873,56.7498106 28.5688517,46.6434454 26.7521668,36.5941354 C55.7850627,67.8679534 60.2737884,110.035497 45.0741912,147.604397 C43.1477482,152.412243 34.4087368,169.688536 30.5558508,174.500185 C25.9081652,180.293182 34.5449882,184.899433 40.8768921,176.067299 C62.2305095,157.490149 95.4985521,90.0471838 54.502029,33.9848142 C44.8168275,20.7404169 41.3840499,21.2881462 47.0914684,22.9541559 C53.1470848,24.7190613 63.7444136,28.587399 69.6524243,31.1320577 C80.6963548,35.8904555 93.148216,21.2691278 83.5954811,15.9744118 Z"></path>
                                        </g>
                                    </svg>
                                    <input type="file" id="target" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageChange(e, 'target')} />
                                    <Image
                                    src={targetImage}
                                    alt="Target Image"
                                    className="m-2 cursor-pointer"
                                    width={200}
                                    height={200}
                                    radius="full"
                                    onClick={() => handleFileInputClick('target')}
                                />
                                </div>
                                <Button auto shadow color="warning" onPress={handleSwapFaceClick} >
                                    Swap Face Now
                                </Button>
                            </CardBody>
                        </Card>

                        {/* Right container for result display */}
                        <Card className="border-none" radius="lg">
                            <CardBody className="flex flex-col items-center">
                                <Image
                                    src={targetImage}
                                    alt="Result Image"
                                    width="100%"
                                    className="object-cover"
                                    radius="lg"
                                />
                            </CardBody>
                        </Card>
                    </div>
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
                        <ModalBody className="flex flex-col items-center justify-center space-y-4">
                                {isLoading && <CircularProgress className="justify-center" color="danger" label="Loading..." size="md" />}

                            {feedbackMessage && <p>{feedbackMessage}</p>}
                            {downloadUrl && <Link isBlock showAnchorIcon color="success" href={downloadUrl} target="_blank" onPress={() => { setShowUploadModal(false)}}>Download the image</Link>}
                            {!isLoading && !downloadUrl && <Button color="warning" onPress={performSwap}>
                                Swap Now
                            </Button>}

                        </ModalBody>
                    </ModalContent>
                </Modal>
            </PhotoFaceSwapLayout>

        </>
    )

}
