// components/VideoGenerator.js
import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../context/AuthContext";
import { Textarea, Card, CardBody, Input,
    Dropdown, DropdownTrigger, DropdownMenu, DropdownItem,
    RadioGroup, Radio, Button, Checkbox, Modal, ModalContent,
    ModalHeader, ModalBody, ModalFooter, CircularProgress, useDisclosure
} from '@nextui-org/react';
import { Link } from 'next/link';
import { useRouter } from 'next/navigation';
import voicesData from '../videoGen/voice';
import toast, { Toaster } from 'react-hot-toast';

const VideoGeneratorPage = () => {
    const apiUrl = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;
    //const apiKey = process.env.NEXT_PUBLIC_VIDEO_API_KEY;
    // console.log(apiUrl);
    // State hooks for the video generator parameters
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
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
    //const [isInvalid, setIsInvalid] = useState(false);
    //const [errorMessage, setErrorMessage] = useState('');

    // Use a single state object for all field values
    const [isInvalid, setIsInvalid] = useState({
        videoSubject: false,
        videoScript: false,
        videoKeywords: false,
        // Add other fields as necessary
    });

    // Single state object for error messages
    const [errors, setErrors] = useState({
        videoSubject: '',
        videoScript: '',
        videoKeywords: ''
        // Add other fields as necessary
    });

    // A function to handle changes in textareas and validate word counts
    const handleChange = (field, value) => {

        let maxWords = 0; // Default word count

        switch(field) {
            case 'videoSubject':
                maxWords = 150; // Max words for video subject
                break;
            case 'videoScript':
                maxWords = 2000; // Max words for video script
                break;
            case 'videoKeywords':
                maxWords = 100; // Assuming max 50 words for video keywords
                break;
            default:
            // Handle unexpected field
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

            }
        }

    };

    /*
    const handleVideoSubjectChange = (e) => {
        const value = e.target.value;
        const wordCount = value.trim().split(/\s+/).length;

        // Reset validation state on change
        setIsInvalid(false);
        setErrorMessage('');

        // Validate the input for word count
        if (wordCount > 150) {
            setIsInvalid(true);
            setErrorMessage('The video subject cannot exceed 150 words.');
        } else {
            setVideoSubject(value);
        }
    };

    const handleVideoTermsChange = (e) => {
        const value = e.target.value;
        // Allow only one period in the input for one sentence.
        if (value.endsWith('.') && videoTerms.includes('.')) {
            return;
        }
        setVideoSubject(value);
    };

    const handleVideoScriptChange = (e) => {
        const value = e.target.value;
        // Allow only one period in the input for one sentence.
        if (value.endsWith('.') && videoSubject.includes('.')) {
            return;
        }
        setVideoScript(value);
    };

     */

    // Handlers for dropdown selections
    const handleAspectRatioChange = (selectedItem) => {
        setAspectRatio(selectedItem);
    };

    const handleAudioChange = (selectedItem) => {
        setAudio(selectedItem);
    };

    const handleSubtitleFontChange = (selectedItem) => {
        setSubtitleFont(selectedItem);
    };

    // Handler to submit the video generator form
    const handleSubmit = async () => {

        // Check if the video subject and audio are selected
        if (!videoSubject.trim()) {
            toast.error("Please enter a video subject.")
            //alert("Please enter a video subject.");
            return;
        }

        if (!audio.value) {
            toast.error("Please select an audio option.")
            //alert("Please select an audio option.");
            return;
        }

        // Ensure videoTerms is handled correctly whether it's an array or a string
        if (Array.isArray(videoTerms) && videoTerms.length === 0) {
            await generateVideoKeywords();
        } else if (typeof videoTerms === 'string' && !videoTerms.trim()) {
            await generateVideoKeywords();
        }

        if (!isAuthenticated) {
            setShowLoginModal(true); // Trigger login modal if not authenticated
            return; // Stop the function from proceeding further
        }

        setIsSubmitting(true);
        setVisible(true);

        const videoData = {
            video_subject: videoSubject,
            video_script: videoScript, // Assuming you will capture this from state similar to videoSubject
            video_terms: videoTerms, // Update as necessary
            video_aspect: aspectRatio.value,
            video_concat_mode: "random", // Update as necessary
            video_clip_duration: 5, // Update as necessary
            video_count: 1, // Update as necessary
            video_language: "", // Update as necessary
            voice_name: audio.value, // Update as necessary, perhaps from audio state
            bgm_type: "random", // Update as necessary
            bgm_file: "", // Update as necessary
            bgm_volume: 0.2, // Update as necessary
            subtitle_enabled: true, // Could be tied to a checkbox state
            subtitle_position: "bottom", // Update as necessary
            font_name: subtitleFont.value, // Update as necessary, perhaps from subtitleFont state
            text_fore_color: "#FFFFFF", // Update as necessary
            text_background_color: "transparent", // Update as necessary
            font_size: 60, // Update as necessary
            stroke_color: "#000000", // Update as necessary
            stroke_width: 2, // Update as necessary
            n_threads: 2, // Update as necessary
            paragraph_number: 1 // Update as necessary
        };
        //console.log("Sending videoData to backend:", JSON.stringify(videoData, null, 2));

        const apiKey = localStorage.getItem('authToken'); // Retrieve the token from local storage

        if (!apiKey) {
            console.log("You must be logged in to perform this action.");
            return;
        }

        // api call to submit the video data
        try {
            const response = await fetch(`${apiUrl}/api/v1/videos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': apiKey
                },
                body: JSON.stringify(videoData),
            });

            const result = await response.json();
            if (response.ok) {
                setTaskId(result.data.task_id);
                // Don't set isSubmitting to false here because we're now waiting for the task to complete
            } else {
                throw new Error(result.message || 'Submission failed');
                setVisible(false);
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
            setVisible(false);
        }

    };

    const generateVideoScript = async () => {
        // Ensure there is a video subject before making the API call
        if (!videoSubject.trim()) {
            toast.error("Please enter a video subject.")
            //alert("Please enter a video subject.");
            return;
        }

        setIsScriptGenerating(true); // Set loading state to true

        try {
            const response = await fetch(`${apiUrl}/api/v1/scripts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video_subject: videoSubject,
                    video_language: "", // Update as necessary
                    paragraph_number: 1,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.status === 200 && data.data && data.data.video_script) {
                // Update the video script state with the generated script
                setVideoScript(data.data.video_script);
            } else {
                console.error("Failed to generate video script: ", data.message);
            }
        } catch (error) {
            console.error("A problem occurred with the fetch operation:", error);
        } finally {
            setIsScriptGenerating(false); // Set loading state to false
        }
    };

    const generateVideoKeywords = async () => {
        // Ensure there is a video subject before making the API call
        if (!videoSubject.trim() || !videoScript.trim() ) {
            toast.error("Please enter a video subject and generate a video script.");
            //alert("Please enter a video subject and generate video script.");
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/v1/terms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video_subject: videoSubject,
                    video_script: videoScript, // Update as necessary
                    amount: 5
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.status === 200 && data.data && data.data.video_terms) {
                // Safely handling different types of data
                const terms = data.data.video_terms;
                if (typeof terms === 'string') {
                    setVideoTerms(terms);
                } else if (Array.isArray(terms)) {
                    setVideoTerms(terms.join(', '));  // Join array elements into a single string
                } else if (terms && typeof terms === 'object') {
                    // Optionally handle object format if expected
                    setVideoTerms(terms.someKey);  // Adjust based on actual data structure
                } else {
                    console.error("Unexpected type for video terms:", typeof terms);
                }
            } else {
                console.error("Failed to generate video keywords: ", data.message);
            }
        } catch (error) {
            console.error("A problem occurred with the fetch operation:", error);
        }
    };

    const videoRef = useRef(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoSources = [
        '/videos/bg1.mp4',
        //'/videos/bg2.mp4',
        '/videos/bg3.mp4',
        '/videos/bg4.mp4',
        '/videos/bg5.mp4',
        '/videos/bg6.mp4',
        '/videos/bg7.mp4',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
        }, 5000); // Change video every 10 seconds

        return () => clearInterval(interval);
    }, [videoSources.length]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play();
        }
    }, [currentVideoIndex]);

    const checkTaskStatus = async () => {
        const apiKey = localStorage.getItem('authToken'); // Retrieve the token from local storage

        if (!apiKey) {
            console.log("You must be logged in to perform this action.");
            return;
        }
        try {
            const response = await fetch(`${apiUrl}/api/v1/tasks/${taskId}`,{
                method: 'GET',
                headers: {'access_token': apiKey}
                }

            );
            const result = await response.json();
            //console.log("======", result.data.progress);
            setTaskProgress(result.data.progress);
            if (response.ok && result.data.progress === 100) {
                setTaskCompleted(true);
                setIsSubmitting(false);
            }
            // Handle other statuses as needed
        } catch (error) {
            console.error("Error fetching task status:", error);
        }
    };

    useEffect(() => {
        let intervalId;

        if (taskId && !taskCompleted) {
            intervalId = setInterval(() => {
                checkTaskStatus();
            }, 2000); // Poll every 2 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [taskId, taskCompleted]);

    //console.log("======", isInvalid.videoSubject);

    const handleClose = () => setVisible(false);

    // Function to navigate to dashboard and close modal
    const handleNavigate = () => {
        if (taskCompleted && taskId) {
            if (typeof taskId === 'string') {
                // taskId is already a string, safe to use directly
                router.push(`/dashboard?taskId=${taskId}`);
            } else if (typeof taskId === 'number') {
                // taskId is a number, convert to string
                router.push(`/dashboard?taskId=${taskId.toString()}`);
            } else {
                // taskId is some other type, handle accordingly or log an error
                console.error('Unexpected type for taskId');
            }
            handleClose(); // Close modal after navigation
        }
    };

    return (
        <>
        <div className="relative flex justify-center items-center min-h-screen w-full overflow-hidden">

            <video autoPlay loop muted playsInline
                   className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
                   key={currentVideoIndex} // Adding key to force re-mount
                   ref={videoRef} // Using ref to access video element
            >
                <source src={videoSources[currentVideoIndex]} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="absolute z-10 w-full h-full p-4 md:p-8 bg-black/50"></div>
            <div className="z-10">
            <Card className="mx-auto max-w-4xl bg-gray-800/60 shadow-lg transform -translate-y-20">
                <CardBody>

                        <div className="flex flex-col items-center gap-4">
                <h3 className="text-center text-2xl md:text-3xl font-bold">
                    AI Video Generator
                </h3>

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
                            maxRows={1}// Adjust the max length as needed
                        />

                        <div className="flex w-full justify-start">
                        <Button variant="bordered" className="bg-transparent shadow-lg font-bold" onPress={generateVideoScript} isLoading={isScriptGenerating}>
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
                            maxLength={2000} // Adjust the max length as needed
                        />
                        <div className="flex w-full justify-start">
                            <Button variant="bordered" className="bg-transparent shadow-lg font-bold" onClick={generateVideoKeywords}>
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
                            maxRows={1}// Adjust the max length as needed
                        />


                        <div className="flex w-full flex-wrap justify-between gap-4 px-8">
                            {/* Update button text to display the label of the selected item */}
                            {createDropdown('Aspect Ratio', aspectRatio, handleAspectRatioChange, [{'Landscape 16:9':'16:9'}, {'Portrait 9:16':'9:16'}])}
                            {createDropdown('Audio', audio, handleAudioChange, voicesData.map(voice => ({[`${voice.name}-${voice.gender}`]: voice.name})))}
                            {createDropdown('Subtitle Font', subtitleFont, handleSubtitleFontChange, [{'STHeitiLight.ttc':'STHeitiLight.ttc'}, {'STHeitiMedium.ttc':'STHeitiMedium.ttc'}])}
                            <Checkbox
                                isSelected={soundEffects}
                                onChange={(e) => setSoundEffects(e.target.checked)}
                                color="primary"
                                size="md"
                            >
                                <p>Sound Effects</p>
                            </Checkbox>
                        </div>
                <Button auto shadow color="warning" onClick={handleSubmit} disabled={isSubmitting || taskCompleted}>
                    Generate Video
                </Button>
                    </div>
                </CardBody>
                </Card>

            </div>

        </div>

            <Modal backdrop="blur" isOpen={visible} placement="center" onClose={handleClose}
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
                                    showValueLabel={true}/>
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
                                    onPress={handleNavigate}
                                >
                                    Download Video {/*${taskId}*/}
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

// Helper function to create dropdown components

function createDropdown(label, selectedItem, onChange, options) {
    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="bordered" className="bg-transparent border-white">
                    {selectedItem.label || `Select ${label}`}
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={`${label} Actions`} className="dark:text-white bg-transparent rounded-lg w-full md:w-auto text-sm md:text-base overflow-y-auto">
                {options.map(option => {
                    const key = Object.keys(option)[0];
                    const value = option[key];
                    const displayLabel = value.startsWith('zh') ? `中文: ${key}` : key;
                    return (
                        <DropdownItem className="overflow-y-auto" key={value} onClick={() => onChange({ label: key, value })}>
                            {displayLabel}
                        </DropdownItem>
                    );
                })}
            </DropdownMenu>
        </Dropdown>
    );
}

export default VideoGeneratorPage;
