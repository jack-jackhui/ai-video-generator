"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

export function useTaskPolling({
    apiUrl,
    taskId,
    onComplete,
    onFailed,
    pollInterval = 120000, // Default 2 minutes
    getDownloadUrl = null
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [taskProgress, setTaskProgress] = useState(0);
    const abortControllerRef = useRef(null);

    const checkTaskStatus = useCallback(async () => {
        if (!taskId) return;

        try {
            const response = await fetch(`${apiUrl}/task-status/${taskId}`);
            const data = await response.json();

            if (response.ok && data.status !== 'In progress' && data.status !== 'Failed') {
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                if (getDownloadUrl) {
                    setDownloadUrl(getDownloadUrl(taskId));
                }
                if (onComplete) {
                    onComplete(data);
                }
            } else if (data.status === 'Failed') {
                setIsLoading(false);
                setFeedbackMessage('Process ' + data.status);
                toast.error("Process Failed! Please try again.");
                if (onFailed) {
                    onFailed(data);
                }
            } else if (data.progress !== undefined) {
                setTaskProgress(data.progress);
            }
        } catch (error) {
            console.error('Error checking task status:', error);
            setIsLoading(false);
            toast.error("Process Failed! Please try again.");
        }
    }, [apiUrl, taskId, getDownloadUrl, onComplete, onFailed]);

    useEffect(() => {
        if (!taskId) return;

        setIsLoading(true);
        const interval = setInterval(() => {
            checkTaskStatus();
        }, pollInterval);

        return () => clearInterval(interval);
    }, [taskId, pollInterval, checkTaskStatus]);

    // Cleanup abort controller on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const startTask = useCallback(() => {
        setIsLoading(true);
        setFeedbackMessage("");
        setDownloadUrl("");
        setTaskProgress(0);
    }, []);

    const resetTask = useCallback(() => {
        setIsLoading(false);
        setFeedbackMessage("");
        setDownloadUrl("");
        setTaskProgress(0);
    }, []);

    const getAbortController = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        return abortControllerRef.current;
    }, []);

    return {
        isLoading,
        setIsLoading,
        feedbackMessage,
        setFeedbackMessage,
        downloadUrl,
        setDownloadUrl,
        taskProgress,
        startTask,
        resetTask,
        getAbortController,
        checkTaskStatus
    };
}
