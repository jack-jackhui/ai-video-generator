// components/VideoGenerator.js
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from "../context/AuthContext";
import videoApi from "../api/VideoApi";
import {
    Textarea, Card, CardBody,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    RadioGroup, Radio, Button, Checkbox, Modal, ModalContent,
    ModalHeader, ModalBody, ModalFooter, CircularProgress
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import voicesData from '../videoGen/voice';
import toast from 'react-hot-toast';
import { useDebouncedCallback } from 'use-debounce';

const VideoGeneratorPage = () => {
    const apiUrl = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;
    const [backendOption, setBackendOption] = useState('default');
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const router = useRouter();
    const [visible, setVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [taskCompleted, setTaskCompleted] = useState(false);
    const [videoSubject, setVideoSubject] = useState('');
    const [videoScript, setVideoScript] = useState('');
    const [videoTerms, setVideoTerms] = useState('');
    const [aspectRatio, setAspectRatio] = useState({label: 'Select Aspect Ratio', value: ''});
    const [audio, setAudio] = useState({label: 'Select Audio', value: ''});
    const [subtitleFont, setSubtitleFont] = useState({label: 'Select Subtitle Font', value: ''});
    const [soundEffects, setSoundEffects] = useState(true);
    const [taskProgress, setTaskProgress] = useState(0);
    const [isScriptGenerating, setIsScriptGenerating] = useState(false);

    const [isInvalid, setIsInvalid] = useState({
        videoSubject: false,
        videoScript: false,
        videoKeywords: false,
    });

    const [errors, setErrors] = useState({
        videoSubject: '',
        videoScript: '',
        videoKeywords: ''
    });

    const handleChange = (field, value) => {
        let maxWords = 0;

        switch(field) {
            case 'videoSubject':
                maxWords = 150;
                break;
            case 'videoScript':
                maxWords = 2000;
                break;
            case 'videoKeywords':
                maxWords = 100;
                break;
            default:
                break;
        }

        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount > maxWords) {
            const errorMessage = `This field cannot exceed ${maxWords} words.`;
            setIsInvalid(prev => ({ ...prev, [field]: true }));
            setErrors(prev => ({ ...prev, [field]: errorMessage }));
        } else {
            switch (field) {
                case 'videoSubject':
                    setVideoSubject(value);
                    break;
                case 'videoScript':
                    setVideoScript(value);
                    break;
                case 'videoKeywords':
                    setVideoTerms(value);
                    break;
                default:
                    break;
            }
        }
    };

    const handleAspectRatioChange = (selectedItem) => {
        setAspectRatio(selectedItem);
    };

    const handleAudioChange = (selectedItem) => {
        setAudio(selectedItem);
    };

    const handleSubtitleFontChange = (selectedItem) => {
        setSubtitleFont(selectedItem);
    };

    const handleSubmit = useDebouncedCallback(async () => {
        if (!videoSubject.trim()) {
            toast.error("Please enter a video subject/description.");
            return;
        }

        if (backendOption === "default" && !audio.value) {
            toast.error("Please select an audio option.");
            return;
        }

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

        const videoData = {
            video_subject: videoSubject,
            video_script: videoScript,
            video_terms: videoTerms,
            video_aspect: aspectRatio.value,
            video_source: backendOption === "sora" ? "sora" : "default",
            video_clip_duration: 5,
            video_count: 1,
            video_language: "",
            voice_name: audio.value,
            bgm_type: "random",
            bgm_file: "",
            bgm_volume: 0.2,
            subtitle_enabled: true,
            subtitle_position: "bottom",
            font_name: subtitleFont.value,
            text_fore_color: "#FFFFFF",
            text_background_color: "transparent",
            font_size: 60,
            stroke_color: "#000000",
            stroke_width: 2,
            n_threads: 2,
            paragraph_number: 1
        };

        try {
            const endpoint = '/api/v1/videos';
            const response = await videoApi.post(endpoint, videoData);
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

    const videoRef = useRef(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoSources = useMemo(() => [
        '/videos/bg1.mp4',
        '/videos/bg3.mp4',
        '/videos/bg4.mp4',
        '/videos/bg5.mp4',
        '/videos/bg6.mp4',
        '/videos/bg7.mp4',
    ], []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [videoSources.length]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play();
        }
    }, [currentVideoIndex]);

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
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
                    key={currentVideoIndex}
                    ref={videoRef}
                >
                    <source src={videoSources[currentVideoIndex]} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="absolute z-10 w-full h-full p-4 md:p-8 bg-black/50"></div>
                <div className="z-10">
                    <Card className="mx-auto min-w-full md:min-w-[800px] max-w-4xl bg-gray-800/60 shadow-lg transform -translate-y-20">
                        <CardBody>
                            <div className="flex flex-col items-center gap-4 w-full">
                                <h3 className="text-center text-2xl md:text-3xl font-bold w-full">
                                    AI Video Generator
                                </h3>
                                <div className="flex w-full justify-left mb-4">
                                    <RadioGroup
                                        label="Select Video Engine"
                                        orientation="horizontal"
                                        value={backendOption}
                                        onValueChange={setBackendOption}
                                    >
                                        <Radio value="default">Stock Video</Radio>
                                        <Radio value="sora">OpenAI Sora</Radio>
                                    </RadioGroup>
                                </div>

                                {backendOption === "sora" && (
                                    <div className="w-full space-y-6">
                                        <Textarea
                                            isRequired
                                            key="videoSubject"
                                            variant="bordered"
                                            label="Video Description"
                                            isInvalid={isInvalid.videoSubject}
                                            errorMessage={errors.videoSubject}
                                            labelPlacement="inside"
                                            placeholder='Describe your video scene (e.g., "Futuristic drone race at sunset on the planet Mars")'
                                            value={videoSubject}
                                            onChange={(e) => handleChange('videoSubject', e.target.value)}
                                            maxLength={1000}
                                            maxRows={1}
                                            className="w-full"
                                        />
                                        <div className="w-full">
                                            {createDropdown(
                                                "Aspect Ratio",
                                                aspectRatio,
                                                handleAspectRatioChange,
                                                [{ "Landscape 16:9": "16:9" }, { "Portrait 9:16": "9:16" }],
                                                true
                                            )}
                                        </div>
                                        <div className="flex justify-center w-full">
                                            <Button
                                                auto
                                                shadow
                                                color="warning"
                                                onClick={handleSubmit}
                                                disabled={isSubmitting || taskCompleted}
                                                className="w-full md:w-auto"
                                            >
                                                Generate Video
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {backendOption === "default" && (
                                    <>
                                        <Textarea
                                            isRequired
                                            key="videoSubject"
                                            variant="underlined"
                                            label="Video Subject"
                                            isInvalid={isInvalid.videoSubject}
                                            errorMessage={errors.videoSubject}
                                            labelPlacement="inside"
                                            placeholder="Enter your video subject - max 150 words."
                                            value={videoSubject}
                                            onChange={(e) => handleChange('videoSubject', e.target.value)}
                                            maxLength={150}
                                            maxRows={1}
                                        />
                                        <div className="flex w-full justify-start">
                                            <Button
                                                variant="bordered"
                                                className="bg-transparent shadow-lg font-bold"
                                                onPress={generateVideoScript}
                                                isLoading={isScriptGenerating}
                                            >
                                                Generate Video Script (optional)
                                            </Button>
                                        </div>
                                        <Textarea
                                            key="videoScript"
                                            variant="bordered"
                                            label="Video Script"
                                            isInvalid={isInvalid.videoScript}
                                            errorMessage={errors.videoScript}
                                            labelPlacement="inside"
                                            placeholder="Use AI to generate your video script and customise it - max 2000 words. This is optional."
                                            value={videoScript}
                                            onChange={(e) => handleChange('videoScript', e.target.value)}
                                            maxLength={2000}
                                        />
                                        <div className="flex w-full justify-start">
                                            <Button
                                                variant="bordered"
                                                className="bg-transparent shadow-lg font-bold"
                                                onClick={generateVideoKeywords}
                                            >
                                                Generate Video Keywords (optional)
                                            </Button>
                                        </div>
                                        <Textarea
                                            key="videoKeywords"
                                            variant="bordered"
                                            label="Video Keywords"
                                            isInvalid={isInvalid.videoKeywords}
                                            errorMessage={errors.videoKeywords}
                                            labelPlacement="inside"
                                            placeholder="Generate video keywords. Optional."
                                            value={videoTerms}
                                            onChange={(e) => handleChange('videoKeywords', e.target.value)}
                                            maxLength={100}
                                            maxRows={1}
                                        />
                                        <div className="flex w-full flex-wrap justify-between gap-4 px-8">
                                            {createDropdown(
                                                "Aspect Ratio",
                                                aspectRatio,
                                                handleAspectRatioChange,
                                                [{ "Landscape 16:9": "16:9" }, { "Portrait 9:16": "9:16" }]
                                            )}
                                            {createDropdown(
                                                "Audio",
                                                audio,
                                                handleAudioChange,
                                                voicesData.map(voice => ({ [`${voice.name}-${voice.gender}`]: voice.name }))
                                            )}
                                            {createDropdown(
                                                "Subtitle Font",
                                                subtitleFont,
                                                handleSubtitleFontChange,
                                                [{ 'STHeitiLight.ttc': 'STHeitiLight.ttc' }, { 'STHeitiMedium.ttc': 'STHeitiMedium.ttc' }]
                                            )}
                                            <Checkbox
                                                isSelected={soundEffects}
                                                onChange={(e) => setSoundEffects(e.target.checked)}
                                                color="primary"
                                                size="md"
                                            >
                                                <p>Sound Effects</p>
                                            </Checkbox>
                                        </div>
                                        <Button
                                            auto
                                            shadow
                                            color="warning"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || taskCompleted}
                                        >
                                            Generate Video
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            <Modal
                backdrop="blur"
                isOpen={visible}
                placement="center"
                onClose={handleClose}
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
                                <Button auto color="success" onPress={handleNavigate}>
                                    Download Video
                                </Button>
                            ) : (
                                <Button isLoading auto flat color="error" onPress={handleClose}>
                                    Loading
                                </Button>
                            )}
                        </div>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

function createDropdown(label, selectedItem, onChange, options, fullWidth = false) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="bordered" className={`bg-transparent border-white ${fullWidth ? 'w-full' : ''}`}>
                    {selectedItem.label || `Select ${label}`}
                </Button>
            </DropdownTrigger>
            <DropdownMenu
                aria-label={`${label} Actions`}
                className="dark:text-white bg-transparent rounded-lg w-full md:w-auto text-sm md:text-base overflow-y-auto"
            >
                {options.map(option => {
                    const key = Object.keys(option)[0];
                    const value = option[key];
                    const displayLabel = value.startsWith('zh') ? `中文: ${key}` : key;
                    return (
                        <DropdownItem
                            className="overflow-y-auto"
                            key={value}
                            onClick={() => onChange({ label: key, value })}
                        >
                            {displayLabel}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}

export default VideoGeneratorPage;
