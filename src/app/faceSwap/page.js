// faceSwap/page.js
"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from "../context/AuthContext";
import FaceSwapLayout from './FaceSwapLayout';
import { tokenStorage } from '../../lib/auth/tokenStorage';
import { FaceSwapCard, FACE_SWAP_CARDS } from '../components/FaceSwapCard';
import { TARGET_FILES } from '../../lib/constants/faceSwap';

import {
    Button,
    Image,
    Link,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    CircularProgress
} from "@nextui-org/react";
import toast from "react-hot-toast";

export default function FaceSwap() {
    const apiUrl = process.env.NEXT_PUBLIC_FACE_SWAP_API_URL;
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [activeCardKey, setActiveCardKey] = useState(null);
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const [downloadUrl, setDownloadUrl] = useState("");
    const abortControllerRef = useRef(null);

    const checkTaskStatus = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/task-status/${taskId}`);
            const data = await response.json();
            if (response.ok && data.status !== 'In progress' && data.status !== 'Failed') {
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                setDownloadUrl(`${apiUrl}/downloads/${taskId}/${TARGET_FILES[activeCardKey]}`);
                setTaskId(null);
            } else if (data.status === 'Failed') {
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                toast.error("Swap Failed! Please try again.");
                setTaskId(null);
            }
        } catch (error) {
            console.error('Error checking task status:', error);
            setIsLoading(false);
            toast.error("Swap Failed! Please try again.");
        }
    }, [apiUrl, taskId, activeCardKey]);

    useEffect(() => {
        if (!taskId) return;

        const interval = setInterval(() => {
            checkTaskStatus();
        }, 120000);

        return () => clearInterval(interval);
    }, [taskId, checkTaskStatus]);

    const toggleUploadModal = (key) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        setActiveCardKey(key);
        setShowUploadModal(!showUploadModal);
        if (!showUploadModal) {
            setImageSrc(null);
            setTaskId(null);
            setFeedbackMessage("");
            setDownloadUrl("");
        }
    };

    const handleImageChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const performSwap = async () => {
        if (!imageSrc) {
            setFeedbackMessage("Please upload a file first.");
            return;
        }

        const token = tokenStorage.get();

        if (!token) {
            setFeedbackMessage("You must be logged in to perform this action.");
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        const formData = new FormData();
        formData.append('source', file);

        try {
            setIsLoading(true);
            setImageSrc(null);
            const targetUrl = `${apiUrl}/swap-face/?target_key=${activeCardKey}`;
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                signal: abortControllerRef.current.signal
            });
            const data = await response.json();

            if (response.ok) {
                setFeedbackMessage(data.message);
                setTaskId(data.task_id);
            } else {
                throw new Error(data.message);
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                return;
            }
            console.error('Error during face swap:', error);
            setFeedbackMessage('Failed to swap face.');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleCloseModal = () => {
        setShowUploadModal(false);
        setImageSrc(null);
        setFeedbackMessage("");
    };

    return (
        <FaceSwapLayout>
            <div className="mt-12 mx-auto px-8 pb-8 grid grid-cols-2 md:grid-cols-3 gap-8">
                {FACE_SWAP_CARDS.map((card) => (
                    <FaceSwapCard
                        key={card.key}
                        cardKey={card.key}
                        title={card.title}
                        subtitle={card.subtitle}
                        videoSrc={card.videoSrc}
                        videoTitle={card.videoTitle}
                        onSwapClick={toggleUploadModal}
                    />
                ))}
            </div>

            <Modal
                backdrop="blur"
                isOpen={showUploadModal}
                onClose={handleCloseModal}
                placement="top-center"
                motionProps={{
                    variants: {
                        enter: {
                            y: 0,
                            opacity: 1,
                            transition: { duration: 0.3, ease: "easeOut" },
                        },
                        exit: {
                            y: -20,
                            opacity: 0,
                            transition: { duration: 0.2, ease: "easeIn" },
                        },
                    }
                }}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Upload</ModalHeader>
                    <ModalBody>
                        <p className="mb-4 text-gray-600">
                            Please upload a photo that you would like to use for the face swap.
                        </p>
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
                            {isLoading && (
                                <CircularProgress
                                    className="justify-center"
                                    color="danger"
                                    label="Loading..."
                                    size="md"
                                />
                            )}
                        </div>
                        {feedbackMessage && <p>{feedbackMessage}</p>}
                        {downloadUrl && (
                            <Link
                                isBlock
                                showAnchorIcon
                                color="success"
                                href={downloadUrl}
                                target="_blank"
                                onPress={handleCloseModal}
                            >
                                Download the video
                            </Link>
                        )}
                    </ModalBody>
                    <ModalFooter className="justify-between">
                        <Button color="danger" onPress={handleCloseModal}>
                            Close
                        </Button>
                        {!isLoading && (
                            <Button color="warning" onPress={performSwap}>
                                Swap Now
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </FaceSwapLayout>
    );
}
