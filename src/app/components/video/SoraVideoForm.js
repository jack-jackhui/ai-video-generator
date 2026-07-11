"use client";
import { Textarea, Button } from '@nextui-org/react';
import VideoDropdown from '../ui/Dropdown';

const ASPECT_RATIO_OPTIONS = [
    { "Landscape 16:9": "16:9" },
    { "Portrait 9:16": "9:16" }
];

export default function SoraVideoForm({
    videoSubject,
    aspectRatio,
    isInvalid,
    errors,
    isSubmitting,
    taskCompleted,
    onVideoSubjectChange,
    onAspectRatioChange,
    onSubmit
}) {
    return (
        <div className="w-full space-y-6">
            <Textarea
                isRequired
                key="videoSubject"
                variant="bordered"
                label="Video Description"
                isInvalid={isInvalid.videoSubject}
                errorMessage={errors.videoSubject}
                labelPlacement="inside"
                placeholder='Describe your video scene (e.g., "Futuristic drone race at sunset on the planet Mars")'
                value={videoSubject}
                onChange={(e) => onVideoSubjectChange('videoSubject', e.target.value)}
                maxLength={1000}
                maxRows={1}
                className="w-full"
            />
            <div className="w-full">
                <VideoDropdown
                    label="Aspect Ratio"
                    selectedItem={aspectRatio}
                    onChange={onAspectRatioChange}
                    options={ASPECT_RATIO_OPTIONS}
                    fullWidth={true}
                />
            </div>
            <div className="flex justify-center w-full">
                <Button
                    auto
                    shadow
                    color="warning"
                    onClick={onSubmit}
                    disabled={isSubmitting || taskCompleted}
                    className="w-full md:w-auto"
                >
                    Generate Video
                </Button>
            </div>
        </div>
    );
}
