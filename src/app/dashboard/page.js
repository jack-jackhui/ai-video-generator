// dashboard/page.js
"use client";
import React, { useEffect, useState} from 'react';
//import Navbar from "../components/Navbar";
//import Footer from "../components/Footer";
import {Card, CardHeader, CardBody, CardFooter, Image, Button} from "@nextui-org/react";
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'
import {Link} from "@nextui-org/react";
import DashboardLayout from './DashboardLayouts';
export default function Dashboard() {
    const apiUrl = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;
    //const router = useRouter();
    // Initialize taskId state
    const searchParams = useSearchParams();
    const taskId = searchParams.get('taskId');
    //const [taskId, setTaskId] = useState(null);

    // Using useEffect to wait for taskId to be available
    /*
    useEffect(() => {
        if (!router.isReady) return;

        // Now router.query is available and you can safely destructure taskId from it
        const { taskId } = router.query;
        setTaskId(taskId); // Set taskId state
    }, [router.isReady, router.query]);

     */

    // Correctly construct the downloadUrl using the taskId state
    const downloadUrl = taskId ? `${apiUrl}/tasks/${taskId}/final-1.mp4` : "";

    return (
        <DashboardLayout>
            <div className="mt-12 max-w-7xl mx-auto px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

                <Card isHoverable isPressable isFooterBlurred className="max-w-xl mx-auto border-none col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
                    {/*<CardHeader className="absolute z-10 top-1 flex-col items-start">*/}
                    <CardHeader className="flex-col">

                        <p className="text-tiny text-white/60 uppercase font-bold">Video</p>
                        <h4 className="text-white/90 font-medium text-xl">Your Generated Video</h4>

                    </CardHeader>
                    <Suspense>
                    <CardBody>
                        {taskId && (
                            <video controls className="w-full">
                                <source src={downloadUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                        {!taskId &&
                            <Image
                            removeWrapper
                            alt="Relaxing app background"
                            className="z-0 w-full h-full object-cover"
                            src="/images/hero3.webp"
                            />
                        }

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
                        {taskId && (
                        <Button color="danger" variant="bordered" showAnchorIcon as={Link} radius="full" size="sm" href={downloadUrl} target="_blank">Download</Button>
                            )}
                    </CardFooter>
                </Card>
            </div>

        </DashboardLayout>

    );
}
