// dashboard/page.js
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Image, Button, Skeleton } from "@nextui-org/react";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Link } from "@nextui-org/react";
import DashboardLayout from './DashboardLayout';
import videoApi from '../api/VideoApi';

export default function Dashboard() {
    const apiUrl = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;
    const searchParams = useSearchParams();
    const taskId = searchParams.get('taskId');
    const backend = searchParams.get('backend'); // 'studio' or null for default
    const [videoUrls, setVideoUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTaskInfo = useCallback(async () => {
        if (!taskId) return;
        setLoading(true);
        setError(null);
        try {
            let taskEndpoint;
            
            if (backend === 'studio') {
                // Use new public-safe result endpoint for studio tasks
                taskEndpoint = `/api/v1/studio/result/${taskId}`;
            } else {
                // Default backend uses tasks endpoint
                taskEndpoint = `/api/v1/tasks/${taskId}`;
            }
            
            const response = await videoApi.get(taskEndpoint);
            const responseData = response.data;
            
            // Normalize data structure - handle both data.data and data directly
            const data = responseData?.data || responseData;
            
            if (data) {
                let videoList = [];
                
                if (backend === 'studio') {
                    // Studio API: check multiple possible locations for video URL
                    // Support data.video_url, data.videos array, or nested data.data.video_url
                    const videoUrl = data.video_url || data.data?.video_url;
                    const videosArray = data.videos || data.data?.videos;
                    
                    if (videoUrl) {
                        // video_url is already a full URL like /api/v1/studio/files/<run_dir>/final.mp4
                        const studioUrl = videoUrl.startsWith('http') 
                            ? videoUrl 
                            : `${apiUrl}${videoUrl}`;
                        videoList = [studioUrl];
                    } else if (Array.isArray(videosArray) && videosArray.length > 0) {
                        // Use videos array if video_url not present
                        videoList = videosArray.map(url => 
                            url.startsWith('http') ? url : `${apiUrl}${url}`
                        );
                    }
                    
                    // Handle error status
                    if (data.status === 'failed' && data.error) {
                        setError(data.error);
                    }
                } else {
                    // Default backend returns videos/original_videos arrays
                    if (Array.isArray(data.original_videos) && data.original_videos.length > 0) {
                        videoList = data.original_videos;
                    } else if (Array.isArray(data.videos)) {
                        videoList = data.videos;
                    }
                    // Map relative paths to download endpoint
                    videoList = videoList.map(
                        p => p.startsWith('http') ? p : `${apiUrl}/api/v1/download/${p.replace(/^\/+/, '')}`
                    );
                }
                
                setVideoUrls(videoList);
            } else {
                setVideoUrls([]);
            }
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
                                <video controls className="w-full">
                                    <source src={downloadUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
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
                        <Button color="danger" variant="bordered" showAnchorIcon as={Link} radius="full" size="sm" href={downloadUrl} target="_blank">Download</Button>
                            )}
                    </CardFooter>
                </Card>
            </div>

        </DashboardLayout>

    );
}
