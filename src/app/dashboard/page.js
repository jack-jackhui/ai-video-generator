"use client";
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Button, Image, Link, Skeleton } from "@nextui-org/react";
import { useSearchParams } from 'next/navigation';
import videoApi from "../api/VideoApi";
import DashboardLayout from "./DashboardLayout";
import { getProxiedVideoUrl } from "../../lib/videoProxyUtil";
import { tokenStorage } from "../../lib/auth/tokenStorage";

function DashboardContent() {
    const searchParams = useSearchParams();
    const taskId = searchParams.get('taskId');
    const backend = searchParams.get('backend');
    const [videoUrls, setVideoUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiUrl = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL || '';

    const fetchTaskInfo = useCallback(async () => {
        if (!taskId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const taskEndpoint = backend === 'studio'
                ? `/api/v1/studio/tasks/${taskId}`
                : `/api/v1/tasks/${taskId}`;

            const response = await videoApi.get(taskEndpoint);
            const result = response.data;

            if (response.status !== 200 || !result.data) {
                throw new Error(result.message || "Failed to fetch task info");
            }

            const data = result.data;
            const status = (data.status || '').toLowerCase();

            if (status === 'failed' || data.error) {
                setError(data.error || "Video generation failed");
                setVideoUrls([]);
                return;
            }

            if (status !== 'completed' && data.progress !== 100) {
                setError("Video is still processing. Please check back later.");
                setVideoUrls([]);
                return;
            }

            let videoList = [];
            if (backend === 'studio') {
                if (data.video_url) {
                    videoList = [data.video_url];
                } else if (data.video_path) {
                    videoList = [data.video_path];
                } else if (Array.isArray(data.videos)) {
                    videoList = data.videos;
                }
            } else {
                if (data.video_path) {
                    videoList = [data.video_path];
                } else if (Array.isArray(data.original_videos)) {
                    videoList = data.original_videos;
                } else if (Array.isArray(data.videos)) {
                    videoList = data.videos;
                }
                // Map relative paths to download endpoint
                videoList = videoList.map(
                    p => p.startsWith('http') ? p : `${apiUrl}/api/v1/download/${p.replace(/^\/+/, '')}`
                );
            }
            
            // Convert all URLs to proxied URLs for authenticated access
            videoList = videoList.map(url => getProxiedVideoUrl(url));
            setVideoUrls(videoList);
        } catch (err) {
            console.error("Error fetching task info:", err);
            setError(err.message || "Failed to fetch task info");
            setVideoUrls([]);
        } finally {
            setLoading(false);
        }
    }, [taskId, backend, apiUrl]);

    useEffect(() => {
        fetchTaskInfo();
    }, [fetchTaskInfo]);

    const downloadUrl = videoUrls.length > 0 ? videoUrls[0] : "";

    // Create a custom video component that adds auth headers
    const AuthenticatedVideo = ({ src }) => {
        const [videoSrc, setVideoSrc] = useState('');
        
        useEffect(() => {
            if (!src) return;
            
            // For proxied URLs, we need to add auth header via fetch and create blob URL
            const token = tokenStorage.get();
            if (!token) {
                setVideoSrc(src);
                return;
            }
            
            fetch(src, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            })
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = URL.createObjectURL(blob);
                setVideoSrc(blobUrl);
            })
            .catch(err => {
                console.error('Error loading video:', err);
                setVideoSrc(src); // Fallback to direct URL
            });
            
            return () => {
                if (videoSrc && videoSrc.startsWith('blob:')) {
                    URL.revokeObjectURL(videoSrc);
                }
            };
        }, [src]);
        
        if (!videoSrc) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-800">
                    <p className="text-gray-400">Loading video...</p>
                </div>
            );
        }
        
        return (
            <video controls className="w-full">
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        );
    };

    // Custom download handler that adds auth headers
    const handleDownload = async (e) => {
        e.preventDefault();
        if (!downloadUrl) return;
        
        const token = tokenStorage.get();
        if (!token) {
            window.open(downloadUrl, '_blank');
            return;
        }
        
        try {
            const response = await fetch(downloadUrl, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });
            
            if (!response.ok) throw new Error('Download failed');
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `video-${taskId}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            // Fallback to direct link
            window.open(downloadUrl, '_blank');
        }
    };

    return (
        <DashboardLayout>
            <div className="mt-12 max-w-7xl mx-auto px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <Card isHoverable isPressable isFooterBlurred className="max-w-xl mx-auto border-none col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
                    <CardHeader className="flex-col">
                        <p className="text-tiny text-white/60 uppercase font-bold">Video</p>
                        <h4 className="text-white/90 font-medium text-xl">Your Generated Video</h4>
                    </CardHeader>
                    <Suspense>
                        <CardBody>
                            {loading && (
                                <div className="space-y-3">
                                    <Skeleton className="w-full rounded-lg">
                                        <div className="h-64 rounded-lg bg-default-300"></div>
                                    </Skeleton>
                                    <div className="flex gap-4">
                                        <Skeleton className="w-1/4 rounded-lg">
                                            <div className="h-4 rounded-lg bg-default-200"></div>
                                        </Skeleton>
                                        <Skeleton className="w-1/4 rounded-lg">
                                            <div className="h-4 rounded-lg bg-default-200"></div>
                                        </Skeleton>
                                    </div>
                                </div>
                            )}
                            {!loading && error && (
                                <div className="text-center text-red-400 py-8">
                                    <p className="text-lg font-medium">Video generation failed</p>
                                    <p className="text-sm mt-2">{error}</p>
                                </div>
                            )}
                            {!loading && !error && downloadUrl && (
                                <AuthenticatedVideo src={downloadUrl} />
                            )}
                            {!taskId && !downloadUrl && !loading && !error && (
                                <Image
                                    removeWrapper
                                    alt="Relaxing app background"
                                    className="z-0 w-full h-full object-cover"
                                    src="/images/hero3.webp"
                                />
                            )}
                        </CardBody>
                    </Suspense>

                    <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                        <div className="flex flex-grow gap-2 items-center">
                            <Image
                                alt="Breathing app icon"
                                className="rounded-full w-10 h-11 bg-black"
                                src="/images/breathing-app-icon.jpeg"
                            />
                            <div className="flex flex-col">
                                <p className="text-tiny text-white/60"></p>
                                <p className="text-tiny text-white/60"></p>
                            </div>
                        </div>
                        {downloadUrl && (
                            <Button 
                                color="danger" 
                                variant="bordered" 
                                showAnchorIcon 
                                radius="full" 
                                size="sm" 
                                onClick={handleDownload}
                            >
                                Download
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </DashboardLayout>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
