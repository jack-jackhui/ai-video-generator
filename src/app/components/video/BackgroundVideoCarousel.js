"use client";
import { useState, useEffect, useRef, useMemo } from 'react';

const VIDEO_SOURCES = [
    '/videos/bg1.mp4',
    '/videos/bg3.mp4',
    '/videos/bg4.mp4',
    '/videos/bg5.mp4',
    '/videos/bg6.mp4',
    '/videos/bg7.mp4',
];

export default function BackgroundVideoCarousel() {
    const videoRef = useRef(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoSources = useMemo(() => VIDEO_SOURCES, []);

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

    return (
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
    );
}
