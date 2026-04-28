"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

const FIELD_LIMITS = {
    videoSubject: 150,
    videoScript: 2000,
    videoKeywords: 100
};

export function useVideoGenForm() {
    const [videoSubject, setVideoSubject] = useState('');
    const [videoScript, setVideoScript] = useState('');
    const [videoTerms, setVideoTerms] = useState('');
    const [aspectRatio, setAspectRatio] = useState({ label: 'Select Aspect Ratio', value: '' });
    const [audio, setAudio] = useState({ label: 'Select Audio', value: '' });
    const [subtitleFont, setSubtitleFont] = useState({ label: 'Select Subtitle Font', value: '' });
    const [soundEffects, setSoundEffects] = useState(true);

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
        const maxWords = FIELD_LIMITS[field] || 0;
        const wordCount = value.trim().split(/\s+/).length;

        if (wordCount > maxWords) {
            const errorMessage = `This field cannot exceed ${maxWords} words.`;
            setIsInvalid(prev => ({ ...prev, [field]: true }));
            setErrors(prev => ({ ...prev, [field]: errorMessage }));
        } else {
            setIsInvalid(prev => ({ ...prev, [field]: false }));
            setErrors(prev => ({ ...prev, [field]: '' }));

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

    const validateForm = () => {
        if (!videoSubject.trim()) {
            toast.error("Please enter a video subject/description.");
            return false;
        }

        if (!audio.value) {
            toast.error("Please select an audio option.");
            return false;
        }

        return true;
    };

    const getFormData = () => ({
        video_subject: videoSubject,
        video_script: videoScript,
        video_terms: videoTerms,
        video_aspect: aspectRatio.value,
        video_source: "default",
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
    });

    return {
        // Form values
        videoSubject,
        videoScript,
        videoTerms,
        aspectRatio,
        audio,
        subtitleFont,
        soundEffects,

        // Setters
        setVideoSubject,
        setVideoScript,
        setVideoTerms,
        setAspectRatio,
        setAudio,
        setSubtitleFont,
        setSoundEffects,

        // Validation state
        isInvalid,
        errors,

        // Handlers
        handleChange,
        validateForm,
        getFormData
    };
}
