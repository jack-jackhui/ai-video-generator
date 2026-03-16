// faceSwap/page.js
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from "../context/AuthContext";
import FaceSwapLayout from './FaceSwapLayout';
import { tokenStorage } from '../../lib/auth/tokenStorage';
import { FaceSwapCard, FACE_SWAP_CARDS } from '../components/FaceSwapCard';
import { TARGET_FILES } from '../../lib/constants/faceSwap';
import { useTaskPolling } from '../hooks/useTaskPolling';

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

export default function FaceSwap() {
    const apiUrl = process.env.NEXT_PUBLIC_FACE_SWAP_API_URL;
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [activeCardKey, setActiveCardKey] = useState(null);
    const [file, setFile] = useState(null);
    const [taskId, setTaskId] = useState(null);
    const { isAuthenticated, setShowLoginModal } = useAuth();

    const getDownloadUrl = useCallback((tid) => {
        return `${apiUrl}/downloads/${tid}/${TARGET_FILES[activeCardKey]}`;
    }, [apiUrl, activeCardKey]);

    const {
        isLoading,
        setIsLoading,
        feedbackMessage,
        setFeedbackMessage,
        downloadUrl,
        resetTask,
        getAbortController
    } = useTaskPolling({
        apiUrl,
        taskId,
        onComplete: () => setTaskId(null),
        onFailed: () => setTaskId(null),
        pollInterval: 120000,
        getDownloadUrl
    });

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
            resetTask();
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

        const abortController = getAbortController();
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
                signal: abortController.signal
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

    const handleCloseModal = () => {
        setShowUploadModal(false);
        setImageSrc(null);
        resetTask();
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
