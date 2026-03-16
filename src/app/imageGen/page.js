"use client";
import React, { useEffect, useState } from 'react';
import ImageGenLayout from './ImageGenLayout';
import ImageGenApi from '../api/ImageGenApi';
import { useAuth } from '../context/AuthContext';
import { parseImageResponse } from '../../lib/utils/parseImageResponse';
import GenerateTab from '../components/image/GenerateTab';
import EditTab from '../components/image/EditTab';
import {
    Button,
    Card,
    CardBody,
    Image,
    Link,
    Tabs,
    Tab,
    CircularProgress,
} from '@nextui-org/react';
import toast from 'react-hot-toast';

export default function Page() {
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const [mode, setMode] = useState('generate');
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
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

    const handleImageResult = async (imageUrl) => {
        try {
            const result = await ImageGenApi.fetchImageWithProxy(imageUrl);
            if (result instanceof Blob) {
                if (resultUrl && resultUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(resultUrl);
                }
                const objectUrl = URL.createObjectURL(result);
                setResultUrl(objectUrl);
            } else {
                setResultUrl(result);
            }
        } catch {
            setResultUrl(imageUrl);
        }
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

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            setIsLoading(true);
            setStatusText('Processing...');
            setResultUrl('');

            if (mode === 'generate') {
                const result = await ImageGenApi.generateImage(prompt);
                const imageUrl = parseImageResponse(result);

                if (imageUrl) {
                    await handleImageResult(imageUrl);
                    setStatusText('Completed successfully!');
                    toast.success('Image generated successfully!');
                } else {
                    throw new Error('No image URL returned from server.');
                }
            } else {
                const result = await ImageGenApi.editImage(file, prompt);

                if (result instanceof Blob) {
                    if (resultUrl && resultUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(resultUrl);
                    }
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
        if (resultUrl && resultUrl.startsWith('blob:')) {
            URL.revokeObjectURL(resultUrl);
        }
        setResultUrl('');
        setStatusText('');
        setIsLoading(false);
    };

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

                            {mode === 'generate' ? (
                                <GenerateTab
                                    prompt={prompt}
                                    setPrompt={setPrompt}
                                    onSubmit={submit}
                                    isLoading={isLoading}
                                />
                            ) : (
                                <EditTab
                                    file={file}
                                    filePreview={filePreview}
                                    prompt={prompt}
                                    setPrompt={setPrompt}
                                    onSelectFile={onSelectFile}
                                    onClearFile={onClearFile}
                                    onSubmit={submit}
                                    isLoading={isLoading}
                                />
                            )}

                            <Button
                                isDisabled={isLoading}
                                color="default"
                                variant="flat"
                                onPress={resetAll}
                            >
                                Reset
                            </Button>

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
