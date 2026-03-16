"use client";
import { Image, Button, Textarea } from '@nextui-org/react';
import { FaArrowUpFromBracket } from "react-icons/fa6";

export default function EditTab({
    file,
    filePreview,
    prompt,
    setPrompt,
    onSelectFile,
    onClearFile,
    onSubmit,
    isLoading
}) {
    const handleFileInputClick = () => {
        document.getElementById('image-upload')?.click();
    };

    return (
        <>
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
                            onClick={handleFileInputClick}
                        />
                        <div className="flex flex-col gap-2">
                            <Button
                                size="sm"
                                color="warning"
                                variant="flat"
                                onPress={handleFileInputClick}
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
                        onClick={handleFileInputClick}
                    >
                        <FaArrowUpFromBracket className="text-2xl text-gray-400" />
                        <Button
                            size="sm"
                            color="warning"
                            variant="flat"
                            onPress={handleFileInputClick}
                        >
                            Upload Image
                        </Button>
                    </div>
                )}
            </div>

            <Textarea
                label="Prompt"
                labelPlacement="outside"
                placeholder="Describe the changes you want to make..."
                minRows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                variant="bordered"
                color="warning"
            />

            <div className="flex items-center justify-center gap-3">
                <Button color="warning" isLoading={isLoading} onPress={onSubmit}>
                    Apply Edit
                </Button>
            </div>
        </>
    );
}
