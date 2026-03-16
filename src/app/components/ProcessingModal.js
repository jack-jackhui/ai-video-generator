"use client";
import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    CircularProgress,
    Link,
    Image
} from "@nextui-org/react";

const MODAL_MOTION_PROPS = {
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
};

export function ProcessingModal({
    isOpen,
    onClose,
    isLoading,
    feedbackMessage,
    downloadUrl,
    imageSrc = null,
    taskProgress = 0,
    showProgress = false,
    title = "Processing",
    downloadLabel = "Download",
    children
}) {
    return (
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            onClose={onClose}
            placement="top-center"
            motionProps={MODAL_MOTION_PROPS}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    {title}
                </ModalHeader>
                <ModalBody>
                    {children}
                    {imageSrc && (
                        <div className="mt-4">
                            <Image src={imageSrc} alt="Preview" isBlurred />
                        </div>
                    )}
                    <div className="mt-4 justify-center">
                        {isLoading && (
                            <CircularProgress
                                className="justify-center"
                                color="danger"
                                label="Loading..."
                                size="md"
                                value={showProgress ? taskProgress : undefined}
                                showValueLabel={showProgress}
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
                            onPress={onClose}
                        >
                            {downloadLabel}
                        </Link>
                    )}
                </ModalBody>
                <ModalFooter className="justify-between">
                    <Button
                        color="danger"
                        onPress={onClose}
                    >
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export function VideoProcessingModal({
    isOpen,
    onClose,
    isSubmitting,
    taskCompleted,
    taskProgress,
    onNavigate
}) {
    return (
        <Modal
            backdrop="blur"
            isOpen={isOpen}
            placement="center"
            onClose={onClose}
            motionProps={MODAL_MOTION_PROPS}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 items-center">
                    {isSubmitting ? "Processing..." : "Video Processing Completed"}
                </ModalHeader>
                <ModalBody>
                    {isSubmitting ? (
                        <div className="flex flex-col gap-1 items-center">
                            <CircularProgress
                                aria-label="Loading..."
                                size="lg"
                                value={taskProgress}
                                color="warning"
                                showValueLabel={true}
                            />
                            Processing your video data...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>Your video processing is completed!</p>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <div className="flex justify-center w-full">
                        {taskCompleted ? (
                            <Button
                                auto
                                color="success"
                                onPress={onNavigate}
                            >
                                Download Video
                            </Button>
                        ) : (
                            <Button isLoading auto flat color="error" onPress={onClose}>
                                Loading
                            </Button>
                        )}
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
