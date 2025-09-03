"use client";
import React, { useEffect, useState } from 'react';
import ImageGenLayout from './imageGenLayouts';
import ImageGenApi from '../api/ImageGenApi';
import { useAuth } from '../context/AuthContext';
import { FaArrowUpFromBracket } from "react-icons/fa6";
import {
    Button,
    Card,
    CardBody,
    Image,
    Link,
    Textarea,
    Tabs,
    Tab,
    CircularProgress,
} from '@nextui-org/react';
import toast from 'react-hot-toast';

export default function Page() {
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const [mode, setMode] = useState('generate'); // 'generate' | 'edit'

    // Prompt and file state
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);

    // Result/flow state
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const [downloadName, setDownloadName] = useState('result.png');

    const onSelectFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setDownloadName(f.name?.replace(/\.\w+$/, '') + '-edited.png');
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target?.result);
        reader.readAsDataURL(f);
    };

    const onClearFile = () => {
        setFile(null);
        setFilePreview(null);
    };

    const submit = async () => {
        if (!prompt?.trim()) {
            toast.error('Please enter a prompt.');
            return;
        }
        if (mode === 'edit' && !file) {
            toast.error('Please upload an image to edit.');
            return;
        }

        // Check authentication before processing
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            setIsLoading(true);
            setStatusText('Processing...');
            setResultUrl('');

            let result;
            if (mode === 'generate') {
                result = await ImageGenApi.generateImage(prompt);

                // Debug: log the actual response structure
                console.log('Generate image response:', result);

                // Handle JSON response for generate mode - check for various possible response formats
                let imageUrl = null;
                if (result?.image_url) {
                    imageUrl = result.image_url;
                } else if (result?.url) {
                    imageUrl = result.url;
                } else if (result?.result_url) {
                    imageUrl = result.result_url;
                } else if (result?.image) {
                    imageUrl = result.image;
                } else if (result?.data?.url) {
                    imageUrl = result.data.url;
                } else if (result?.data?.image_url) {
                    imageUrl = result.data.image_url;
                } else if (typeof result === 'string') {
                    imageUrl = result;
                }

                if (imageUrl) {
                    // Create a proxy fetch to bypass CORS issues
                    try {
                        // Use Next.js API route as proxy to fetch the image
                        const proxyResponse = await fetch('/api/proxy-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageUrl })
                        });
                        
                        if (proxyResponse.ok) {
                            const imageBlob = await proxyResponse.blob();
                            
                            // Clean up previous object URL if it exists
                            if (resultUrl && resultUrl.startsWith('blob:')) {
                                URL.revokeObjectURL(resultUrl);
                            }
                            
                            // Create object URL from blob
                            const objectUrl = URL.createObjectURL(imageBlob);
                            setResultUrl(objectUrl);
                        } else {
                            throw new Error('Proxy fetch failed');
                        }
                    } catch (fetchError) {
                        console.warn('Failed to fetch image via proxy, trying direct fetch:', fetchError);
                        
                        // Fallback: try direct fetch with no-cors mode
                        try {
                            const directResponse = await fetch(imageUrl, { mode: 'no-cors' });
                            // Note: no-cors mode doesn't allow reading response, so we fall back to direct URL
                            setResultUrl(imageUrl);
                        } catch (directError) {
                            console.warn('Direct fetch also failed, using URL as-is:', directError);
                            setResultUrl(imageUrl);
                        }
                    }
                    
                    setStatusText('Completed successfully!');
                    toast.success('Image generated successfully!');
                } else {
                    console.error('Unexpected response structure:', result);
                    throw new Error('No image URL returned from server. Response: ' + JSON.stringify(result));
                }
            } else {
                // Handle blob response for edit mode
                result = await ImageGenApi.editImage(file, prompt);

                if (result instanceof Blob) {
                    // Clean up previous object URL if it exists
                    if (resultUrl && resultUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(resultUrl);
                    }

                    // Create object URL from blob
                    const objectUrl = URL.createObjectURL(result);
                    setResultUrl(objectUrl);
                    setStatusText('Completed successfully!');
                    toast.success('Image edited successfully!');
                } else {
                    throw new Error('Invalid response format from server');
                }
            }

        } catch (error) {
            console.error('Error:', error);
            setStatusText('Process failed.');
            toast.error(error?.message || `Failed to ${mode} image.`);
        } finally {
            setIsLoading(false);
        }
    };

    const resetAll = () => {
        setPrompt('');
        if (mode === 'edit') onClearFile();

        // Clean up object URL if it exists
        if (resultUrl && resultUrl.startsWith('blob:')) {
            URL.revokeObjectURL(resultUrl);
        }

        setResultUrl('');
        setStatusText('');
        setIsLoading(false);
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            if (resultUrl && resultUrl.startsWith('blob:')) {
                URL.revokeObjectURL(resultUrl);
            }
        };
    }, [resultUrl]);

    return (
        <ImageGenLayout>
            <div className="flex justify-center items-center min-h-screen h-full">
                <div className="w-4/5 bg-gray-900 p-0 rounded-lg shadow-lg grid grid-cols-1 md:grid-cols-2 gap-8 mt-0 md:mt-0 -mt-20">
                    {/* Left: Controls */}
                    <Card className="border-none p-0 m-0" radius="lg">
                        <CardBody className="flex flex-col gap-5 p-5">
                            <Tabs
                                selectedKey={mode}
                                onSelectionChange={(k) => setMode(k?.toString())}
                                aria-label="Image generation modes"
                                color="warning"
                                variant="bordered"
                                className="self-center"
                            >
                                <Tab key="generate" title="Generate New" />
                                <Tab key="edit" title="Edit Image" />
                            </Tabs>

                            {mode === 'edit' && (
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onSelectFile}
                                        style={{ display: 'none' }}
                                        id="image-upload"
                                    />

                                    {filePreview ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <Image
                                                src={filePreview}
                                                alt="Image to Edit"
                                                className="cursor-pointer"
                                                width={200}
                                                height={200}
                                                radius="lg"
                                                onClick={() => document.getElementById('image-upload')?.click()}
                                            />
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    size="sm"
                                                    color="warning"
                                                    variant="flat"
                                                    onPress={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    Change Image
                                                </Button>
                                                <Button size="sm" color="default" variant="light" onPress={onClearFile}>
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="w-full h-40 border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-warning-400 transition-colors gap-3"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                        >
                                            <FaArrowUpFromBracket className="text-2xl text-gray-400" />

                                            <Button
                                                size="sm"
                                                color="warning"
                                                variant="flat"
                                                onPress={() => document.getElementById('image-upload')?.click()}
                                            >
                                                Upload Image
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Textarea
                                label="Prompt"
                                labelPlacement="outside"
                                placeholder={
                                    mode === 'generate'
                                        ? 'Describe the image you want to generate...'
                                        : 'Describe the changes you want to make...'
                                }
                                minRows={3}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                variant="bordered"
                                color="warning"
                            />

                            <div className="flex items-center justify-center gap-3">
                                <Button
                                    isDisabled={isLoading}
                                    color="default"
                                    variant="flat"
                                    onPress={resetAll}
                                >
                                    Reset
                                </Button>
                                <Button color="warning" isLoading={isLoading} onPress={submit}>
                                    {mode === 'generate' ? 'Generate Image' : 'Apply Edit'}
                                </Button>
                            </div>

                            {isLoading && (
                                <div className="flex items-center gap-3">
                                    <CircularProgress color="warning" aria-label="Loading" size="md" />
                                    <span className="text-sm opacity-80">{statusText}</span>
                                </div>
                            )}
                            {!isLoading && statusText && (
                                <span className="text-sm opacity-80">{statusText}</span>
                            )}
                        </CardBody>
                    </Card>

                    {/* Right: Result */}
                    <Card className="border-none" radius="lg">
                        <CardBody className="flex flex-col items-center justify-center gap-4">
                            {resultUrl ? (
                                <>
                                    <Image
                                        src={resultUrl}
                                        alt="Generated/Edited Result"
                                        width="100%"
                                        className="object-cover max-h-96"
                                        radius="lg"
                                    />
                                    <div className="flex gap-3">
                                        <Link
                                            isBlock
                                            showAnchorIcon
                                            color="success"
                                            href={resultUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View Full Size
                                        </Link>
                                        <Link
                                            isBlock
                                            showAnchorIcon
                                            color="warning"
                                            href={resultUrl}
                                            download={downloadName}
                                        >
                                            Download
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-4 text-center">
                                    <Image
                                        src="/images/Scarlett_Johansson.png"
                                        alt="Result Preview"
                                        width="100%"
                                        className="object-cover max-h-96 opacity-30"
                                        radius="lg"
                                    />
                                    <span className="text-sm opacity-70">
                                        {mode === 'generate'
                                            ? 'Your generated image will appear here'
                                            : 'Your edited image will appear here'}
                                    </span>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </ImageGenLayout>
    );
}
