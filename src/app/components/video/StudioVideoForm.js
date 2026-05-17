"use client";
import { Textarea, Button, Select, SelectItem } from "@nextui-org/react";
import VideoDropdown from "../ui/Dropdown";

const ASPECT_RATIO_OPTIONS = [
    { "Portrait 9:16 (TikTok/Reels)": "9:16" },
    { "Landscape 16:9 (YouTube)": "16:9" },
    { "Square 1:1 (Instagram)": "1:1" }
];

const DEFAULT_STUDIO_FRAME_TEMPLATE = '1080x1920/image_default.html';

const TEMPLATE_OPTIONS = [
    { label: "Default (Image-based)", value: DEFAULT_STUDIO_FRAME_TEMPLATE },
    { label: "Cinematic", value: "1080x1920/cinematic.html" },
    { label: "Minimal", value: "1080x1920/minimal.html" }
];

/**
 * StudioVideoForm - Form for AI Video Studio generation
 * 
 * Uses AI-generated images (GPT-Image-2) and TTS narration
 * to create videos from text descriptions.
 */
export default function StudioVideoForm({
    videoSubject,
    aspectRatio,
    nScenes,
    frameTemplate,
    isInvalid,
    errors,
    isSubmitting,
    taskCompleted,
    onVideoSubjectChange,
    onAspectRatioChange,
    onNScenesChange,
    onFrameTemplateChange,
    onSubmit
}) {
    return (
        <div className="w-full space-y-6">
            <Textarea
                isRequired
                key="videoSubject"
                variant="bordered"
                label="Video Description"
                isInvalid={isInvalid?.videoSubject}
                errorMessage={errors?.videoSubject}
                labelPlacement="inside"
                placeholder="Describe your video content in detail. The AI will generate images and narration based on your description."
                value={videoSubject}
                onChange={(e) => onVideoSubjectChange("videoSubject", e.target.value)}
                maxLength={2000}
                minRows={3}
                maxRows={6}
                className="w-full"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <VideoDropdown
                    label="Aspect Ratio"
                    selectedItem={aspectRatio}
                    onChange={onAspectRatioChange}
                    options={ASPECT_RATIO_OPTIONS}
                    fullWidth={true}
                />
                
                <Select
                    label="Number of Scenes"
                    placeholder="Select scenes"
                    selectedKeys={[String(nScenes || 3)]}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        onNScenesChange(Number.isNaN(val) ? 3 : val);
                    }}
                    variant="bordered"
                    className="w-full"
                >
                    {[2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <SelectItem key={String(num)} value={String(num)}>
                            {num} scenes
                        </SelectItem>
                    ))}
                </Select>
                
                <Select
                    label="Video Template"
                    placeholder="Select template"
                    selectedKeys={[frameTemplate || TEMPLATE_OPTIONS[0].value]}
                    onChange={(e) => onFrameTemplateChange(e.target.value || DEFAULT_STUDIO_FRAME_TEMPLATE)}
                    variant="bordered"
                    className="w-full"
                >
                    {TEMPLATE_OPTIONS.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                            {template.label}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            
            <p className="text-sm text-gray-400">
                AI Video Studio creates videos using AI-generated images and professional narration.
                Describe your video topic and let AI handle the visuals and voiceover.
            </p>
            
            <div className="flex justify-center w-full">
                <Button
                    auto
                    shadow
                    color="warning"
                    onClick={onSubmit}
                    disabled={isSubmitting || taskCompleted}
                    className="w-full md:w-auto px-8"
                >
                    Generate Video
                </Button>
            </div>
        </div>
    );
}
