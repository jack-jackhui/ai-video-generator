"use client";
import React, { Suspense } from 'react';
import {
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Image,
    Button,
    Link
} from "@nextui-org/react";

export function FaceSwapCard({
    cardKey,
    title,
    subtitle,
    videoSrc,
    videoTitle,
    onSwapClick
}) {
    return (
        <Card
            key={cardKey}
            isHoverable
            isPressable
            isFooterBlurred
            className="max-w-xl mx-auto border-none"
        >
            <CardHeader className="flex-col">
                <p className="text-tiny text-white/60 uppercase font-bold">{title}</p>
                <h4 className="text-white/90 font-medium text-xl">{subtitle}</h4>
            </CardHeader>
            <Suspense fallback={<div>Loading...</div>}>
                <CardBody>
                    <iframe
                        className="w-full h-full"
                        src={videoSrc}
                        title={videoTitle}
                        frameBorder="0"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </CardBody>
            </Suspense>
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
                <div className="flex flex-grow gap-2 items-center">
                    <Image
                        alt="App icon"
                        className="rounded-full w-10 h-11 bg-black"
                        src="/images/breathing-app-icon.jpeg"
                    />
                    <div className="flex flex-col">
                        <p className="text-tiny text-white/60"></p>
                        <p className="text-tiny text-white/60"></p>
                    </div>
                </div>
                <Button
                    color="danger"
                    variant="bordered"
                    showAnchorIcon
                    as={Link}
                    radius="full"
                    size="sm"
                    onPress={() => onSwapClick(cardKey)}
                >
                    Face Swap
                </Button>
            </CardFooter>
        </Card>
    );
}

export const FACE_SWAP_CARDS = [
    {
        key: 1,
        title: "The Great Gatsby",
        subtitle: "Leonardo Dicaprio",
        videoSrc: "https://player.bilibili.com/player.html?aid=1104352221&bvid=BV1Yw4m197RP&cid=1541084995&p=1&autoplay=0",
        videoTitle: "Leonardo Dicaprio - The Great Gatsby"
    },
    {
        key: 2,
        title: "Robert Downey Jr",
        subtitle: "Iron Man",
        videoSrc: "https://player.bilibili.com/player.html?bvid=BV1gm421u753&cid=1541078218&page=1&autoplay=0",
        videoTitle: "Robert Downey Jr - Iron Man"
    },
    {
        key: 3,
        title: "Zhen Huan",
        subtitle: "Sun Li",
        videoSrc: "https://player.bilibili.com/player.html?aid=1604300326&bvid=BV1Jm421p7g8&cid=1541089940&p=1&autoplay=0",
        videoTitle: "Sun Li - Zhen Huan"
    },
    {
        key: 4,
        title: "A Better Tomorrow",
        subtitle: "Chow Yun Fat",
        videoSrc: "https://player.bilibili.com/player.html?aid=1004425596&bvid=BV1Hx4y1i7dL&cid=1541084810&p=1&autoplay=0",
        videoTitle: "Chow Yun Fat - A Better Tomorrow"
    }
];
