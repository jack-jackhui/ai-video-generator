// components/VideoGenerator.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../context/AuthContext";
import videoApi from "../api/VideoApi";
import { Card, CardBody } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';
import { useVideoGenForm } from '../hooks/useVideoGenForm';
import VideoEngineSelector from './video/VideoEngineSelector';
import DefaultVideoForm from './video/DefaultVideoForm';
import SoraVideoForm from './video/SoraVideoForm';
import BackgroundVideoCarousel from './video/BackgroundVideoCarousel';
import { VideoProcessingModal } from './ProcessingModal';

const VideoGeneratorPage = () => {
    const [backendOption, setBackendOption] = useState('default');
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [taskCompleted, setTaskCompleted] = useState(false);
    const [taskProgress, setTaskProgress] = useState(0);
    const [isScriptGenerating, setIsScriptGenerating] = useState(false);

    const {
        videoSubject,
        videoScript,
        videoTerms,
        aspectRatio,
        audio,
        subtitleFont,
        soundEffects,
        setVideoScript,
        setVideoTerms,
        setAspectRatio,
        setAudio,
        setSubtitleFont,
        setSoundEffects,
        isInvalid,
        errors,
        handleChange,
        validateForm,
        getFormData
    } = useVideoGenForm();

    const handleSubmit = useDebouncedCallback(async () => {
        if (!validateForm(backendOption)) return;

        if (backendOption === "default") {
            if (Array.isArray(videoTerms) && videoTerms.length === 0) {
                await generateVideoKeywords();
            } else if (typeof videoTerms === 'string' && !videoTerms.trim()) {
                await generateVideoKeywords();
            }
        }

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        setIsSubmitting(true);
        setVisible(true);

        try {
            const endpoint = '/api/v1/videos';
            const response = await videoApi.post(endpoint, getFormData(backendOption));
            const result = response.data;
            if (response.status === 200) {
                setTaskId(result.data.task_id);
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            toast.error("Error submitting video data: " + error.message);
            setIsSubmitting(false);
            setVisible(false);
        }
    }, 1000);

    const generateVideoScript = async () => {
        if (!videoSubject.trim()) {
            toast.error("Please enter a video subject.");
            return;
        }

        setIsScriptGenerating(true);

        try {
            const response = await videoApi.post('/api/v1/scripts', {
                video_subject: videoSubject,
                video_language: "",
                paragraph_number: 1,
            });

            if (response.status === 200 && response.data) {
                setVideoScript(response.data.data.video_script);
            } else {
                console.error("Failed to generate video script: ", response.data.message);
            }
        } catch (error) {
            console.error("A problem occurred with the fetch operation:", error);
        } finally {
            setIsScriptGenerating(false);
        }
    };

    const generateVideoKeywords = async () => {
        if (!videoSubject.trim() || !videoScript.trim()) {
            toast.error("Please enter a video subject and generate a video script.");
            return;
        }

        try {
            const response = await videoApi.post('/api/v1/terms', {
                video_subject: videoSubject,
                video_script: videoScript,
                amount: 5
            });
            if (response.status === 200 && response.data) {
                const terms = response.data.data.video_terms;
                if (typeof terms === 'string') {
                    setVideoTerms(terms);
                } else if (Array.isArray(terms)) {
                    setVideoTerms(terms.join(', '));
                } else if (terms && typeof terms === 'object') {
                    setVideoTerms(terms.someKey);
                } else {
                    console.error("Unexpected type for video terms:", typeof terms);
                }
            } else {
                console.error("Failed to generate video keywords: ", response.data.message);
            }
        } catch (error) {
            console.error("A problem occurred with the fetch operation:", error);
        }
    };

    const checkTaskStatus = useCallback(async () => {
        try {
            const response = await videoApi.get(`/api/v1/tasks/${taskId}`);
            const result = response.data;
            setTaskProgress(result.data.progress);
            if (response.status === 200 && result.data.progress === 100) {
                setTaskCompleted(true);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Error fetching task status:", error);
        }
    }, [taskId]);

    useEffect(() => {
        if (!taskId || taskCompleted) return;

        const intervalId = setInterval(() => {
            checkTaskStatus();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [taskId, taskCompleted, checkTaskStatus]);

    const handleClose = () => setVisible(false);

    const handleNavigate = () => {
        if (taskCompleted && taskId) {
            const taskIdStr = typeof taskId === 'number' ? taskId.toString() : taskId;
            router.push(`/dashboard?taskId=${taskIdStr}`);
            handleClose();
        }
    };

    return (
        <>
            <div className="relative flex justify-center items-center min-h-screen w-full overflow-hidden">
                <BackgroundVideoCarousel />
                <div className="absolute z-10 w-full h-full p-4 md:p-8 bg-black/50"></div>
                <div className="z-10">
                    <Card className="mx-auto min-w-full md:min-w-[800px] max-w-4xl bg-gray-800/60 shadow-lg transform -translate-y-20">
                        <CardBody>
                            <div className="flex flex-col items-center gap-4 w-full">
                                <h3 className="text-center text-2xl md:text-3xl font-bold w-full">
                                    AI Video Generator
                                </h3>
                                <VideoEngineSelector
                                    value={backendOption}
                                    onChange={setBackendOption}
                                />

                                {backendOption === "sora" && (
                                    <SoraVideoForm
                                        videoSubject={videoSubject}
                                        aspectRatio={aspectRatio}
                                        isInvalid={isInvalid}
                                        errors={errors}
                                        isSubmitting={isSubmitting}
                                        taskCompleted={taskCompleted}
                                        onVideoSubjectChange={handleChange}
                                        onAspectRatioChange={setAspectRatio}
                                        onSubmit={handleSubmit}
                                    />
                                )}

                                {backendOption === "default" && (
                                    <DefaultVideoForm
                                        videoSubject={videoSubject}
                                        videoScript={videoScript}
                                        videoTerms={videoTerms}
                                        aspectRatio={aspectRatio}
                                        audio={audio}
                                        subtitleFont={subtitleFont}
                                        soundEffects={soundEffects}
                                        isInvalid={isInvalid}
                                        errors={errors}
                                        isSubmitting={isSubmitting}
                                        taskCompleted={taskCompleted}
                                        isScriptGenerating={isScriptGenerating}
                                        onVideoSubjectChange={handleChange}
                                        onAspectRatioChange={setAspectRatio}
                                        onAudioChange={setAudio}
                                        onSubtitleFontChange={setSubtitleFont}
                                        onSoundEffectsChange={setSoundEffects}
                                        onGenerateScript={generateVideoScript}
                                        onGenerateKeywords={generateVideoKeywords}
                                        onSubmit={handleSubmit}
                                    />
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <VideoProcessingModal
                isOpen={visible}
                onClose={handleClose}
                isSubmitting={isSubmitting}
                taskProgress={taskProgress}
                taskCompleted={taskCompleted}
                onNavigate={handleNavigate}
            />
        </>
    );
};

export default VideoGeneratorPage;
