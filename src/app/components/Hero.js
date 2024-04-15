// components/Hero.js
"use client";
import ImageSlider from './ImageSlider';
import {useEffect, useRef, useState} from "react";
import { Button, Card, CardHeader, CardBody, CardFooter, Image } from "@nextui-org/react";
import { MdOndemandVideo } from "react-icons/md";
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Define animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5
        }
    }
};
const Hero = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.5  // Trigger when 50% of the element is in view
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    const nextSectionRef = useRef(null);
    const videoRef = useRef(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoSources = [
        '/videos/hero/hero_bg1.mp4',
        '/videos/hero/hero_bg2.mp4',
        '/videos/hero/hero_bg3.mp4',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
        }, 5000); // Change video every 10 seconds

        return () => clearInterval(interval);
    }, [videoSources.length]);

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
    };

    const handleLearnMoreClick = () => {
        nextSectionRef.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Apply the motion.div with variants to animate the container */}
            <motion.div
                className="relative z-0 min-h-screen w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Video and overlay */}
                <video autoPlay loop muted
                       className="absolute top-0 left-0 w-full h-full object-cover"
                       key={currentVideoIndex}
                       ref={videoRef}>
                    <source src={videoSources[currentVideoIndex]} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

                <motion.div className="absolute top-1/4 left-0 w-full flex flex-col justify-center items-center text-center z-20"
                            variants={itemVariants}>
                    <h2 className="text-white text-6xl mt-0">AI-Powered Video Generation</h2>
                    <p className="text-white text-xl mt-4 mb-8">Instantly turn your text inputs into publish-worthy videos.</p>
                    <motion.div variants={itemVariants}>
                        <Button onPress={handleLearnMoreClick}
                                disableRipple
                                className="relative overflow-visible rounded-full
                                hover:-translate-y-1 px-12 shadow-xl after:content-['']
                                after:absolute after:rounded-full after:inset-0 after:bg-gradient-to-r from-pink-500
                                via-red-500 to-yellow-500
                                after:z-[-1] after:transition after:!duration-500 hover:after:scale-150
                                hover:after:opacity-0 hover:bg-gradient-to-r from-pink-500
                                via-red-500 to-yellow-500">Learn More</Button>
                    </motion.div>
                </motion.div>
            </motion.div>
            {/* Content section with scroll ref */}
            <div ref={nextSectionRef} className="p-24">
            <div ref={ref} className="p-24">

                {/* New section for categories */}
                <motion.div className="container mx-auto px-4 py-16 bg-slate-800 rounded-xl"
                            variants={variants}
                            initial="hidden"
                            animate={controls}
                >
                    <h1 className="text-center text-5xl mb-10">Transform your ideas into captivating videos</h1>
                    <motion.div className="flex justify-between space-x-4 mb-8" variants={itemVariants}>
                        {/* Category buttons */}
                        <Button variant="bordered">Content Creation</Button>
                        <Button variant="bordered">Business & Corporate</Button>
                        <Button variant="bordered">Marketing & Social Media</Button>
                        <Button variant="bordered">Education & E-Learning</Button>
                        <Button variant="bordered">eCommerce</Button>
                        <Button variant="bordered">Localization & Translation</Button>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center" variants={itemVariants}>
                        {/* Example category card */}
                        <Card isFooterBlurred className="bg-transparent w-full max-w-lg py-4 max-auto">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <h4 className="text-large">Sample Video 1</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2">
                                <div>
                                    <iframe
                                        className="w-full h-[300px]"
                                        src="https://youtube.com/embed/EW_Xwm1PObw?feature=shared" // Replace VIDEO_ID with the actual YouTube video ID
                                        title="Visiting Italy"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </CardBody>
                        </Card>

                        <Card className="bg-transparent w-full max-w-lg py-4 mx-auto">
                            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                                <h4 className="text-large">Sample Video 2</h4>
                            </CardHeader>
                            <CardBody className="overflow-visible py-2">
                                <div>
                                    <iframe
                                        className="w-full h-[300px]"
                                        src="https://youtube.com/embed/8xRuL7m6kFk?feature=shared" // Replace VIDEO_ID with the actual YouTube video ID
                                        title="What is DeFi"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>

                            </CardBody>
                        </Card>

                        {/* Repeat for other categories... */}
                    </motion.div>
                    <motion.div className="flex justify-center mt-8" variants={itemVariants}>
                        <Link href="/videoGen"> <Button startContent={<MdOndemandVideo />} disableRipple
                                className="relative overflow-visible rounded-full hover:-translate-y-1 px-12 shadow-xl after:content-[''] after:absolute after:rounded-full after:inset-0 after:bg-slate-800 after:z-[-1] after:transition after:!duration-500 hover:after:scale-150 hover:after:opacity-0 hover:bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
                                size="lg"> Create You Own Video</Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/*<ImageSlider />*/}
            </div>
            </div>
        </div>
    );
};


export default Hero;
