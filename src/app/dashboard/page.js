// dashboard/page.js
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardBody, CardFooter, Image, Button, Skeleton } from "@nextui-org/react";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Link } from "@nextui-org/react";
import DashboardLayout from './DashboardLayout';
import { tokenStorage } from '../../lib/auth/tokenStorage';

export default function Dashboard() {
    const apiUrl = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;
    const searchParams = useSearchParams();
    const taskId = searchParams.get('taskId');
    const [videoUrls, setVideoUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchTaskInfo = useCallback(async () => {
        if (!taskId) return;
        setLoading(true);
        const token = tokenStorage.get();
        try {
            const res = await fetch(`${apiUrl}/api/v1/tasks/${taskId}`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            const data = await res.json();
            if (data && data.data) {
                let videoList = [];
                if (Array.isArray(data.data.original_videos) && data.data.original_videos.length > 0) {
                    videoList = data.data.original_videos;
                } else if (Array.isArray(data.data.videos)) {
                    videoList = data.data.videos;
                }
                setVideoUrls(videoList.map(
                    p => p.startsWith('http') ? p : `${apiUrl}/api/v1/download/${p.replace(/^\/+/, '')}`
                ));
            } else {
                setVideoUrls([]);
            }
        } catch {
            setVideoUrls([]);
        } finally {
            setLoading(false);
        }
    }, [taskId, apiUrl]);

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
                            {!loading && downloadUrl && (
                                <video controls className="w-full">
                                    <source src={downloadUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {!taskId && !downloadUrl && !loading && (
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
