// components/ImageSlider.js
"use client";
import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../css/ImageSlider.css";
import {Image, Button} from "@nextui-org/react";
import { motion } from 'framer-motion';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

const images = [
    '/images/hero1.webp',
    '/images/hero2.webp',
    '/images/hero3.webp',
    // Add more images as needed
];

const imageVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
};

const ImageSlider = () => {
    const [[page, direction], setPage] = useState([0, 0]);

    const paginate = (newDirection) => {
        setPage((prev) => [(prev[0] + newDirection + images.length) % images.length, newDirection]);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            paginate(1);
        }, 3000); // Change slide every 3 seconds

        return () => clearInterval(interval);
    }, []);

    /*
    const [sliderSettings, setSliderSettings] = useState({
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    });

     */

    /*
    const imageVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 5 } }, // You can adjust the duration
    };

     */


    return (
        <>

        <div className="flex items-center justify-center gap-4 my-8">
            <Button auto isIconOnly variant="light" startContent={<AiOutlineLeft />} onClick={() => paginate(-1)} disabled={page === 0}  />
            <motion.div
                className="w-[600px] h-[500px] flex justify-center items-center overflow-hidden"
                key={page}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 1.5 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);

                    if (swipe < -swipeConfidenceThreshold) {
                        paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                        paginate(-1);
                    }
                }}
            >
                <Image
                    isBlurred
                    src={images[page % images.length]}
                    alt={`Slide ${page % images.length}`}
                    className="w-full h-full object-cover"
                />
            </motion.div>
            <Button auto isIconOnly variant="light" startContent={<AiOutlineRight />} onClick={() => paginate(1)} disabled={page === images.length - 1} />
        </div>

        {/*
    <div className="my-8 mx-auto max-w-[600px]">
        <Slider {...sliderSettings}>
            {images.map((img, idx) => (
                <motion.div key={idx}
                            initial="hidden"
                            animate="visible"
                            variants={imageVariants}
                            className="flex justify-center items-center">

                    <Image width={600} height={500} isBlurred src={img} alt={`Slide ${idx}`} className="image-3d"/>

                </motion.div>
            ))}
        </Slider>
    </div>
*/
        }

        </>
    );
};

export default ImageSlider;
