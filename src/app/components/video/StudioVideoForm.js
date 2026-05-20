"use client";
import { Textarea, Button, Select, SelectItem } from "@nextui-org/react";
import VideoDropdown from "../ui/Dropdown";

const ASPECT_RATIO_OPTIONS = [
    { "Portrait 9:16 (TikTok/Reels)": "9:16" },
    { "Landscape 16:9 (YouTube)": "16:9" },
    { "Square 1:1 (Instagram)": "1:1" }
];

const DEFAULT_STUDIO_FRAME_TEMPLATE = '1080x1920/image_default.html';

// Template options matching Pixelle templates across all resolutions
const TEMPLATE_OPTIONS = [
    // Portrait (9:16) - 1080x1920 templates
    { label: "Default (Image-based)", value: "1080x1920/image_default.html", aspect: "9:16" },
    { label: "Elegant", value: "1080x1920/image_elegant.html", aspect: "9:16" },
    { label: "Modern", value: "1080x1920/image_modern.html", aspect: "9:16" },
    { label: "Neon", value: "1080x1920/image_neon.html", aspect: "9:16" },
    { label: "Full Image", value: "1080x1920/image_full.html", aspect: "9:16" },
    { label: "Healing", value: "1080x1920/image_healing.html", aspect: "9:16" },
    { label: "Video Healing", value: "1080x1920/video_healing.html", aspect: "9:16" },
    { label: "Cartoon", value: "1080x1920/image_cartoon.html", aspect: "9:16" },
    { label: "Fashion Vintage", value: "1080x1920/image_fashion_vintage.html", aspect: "9:16" },
    { label: "Life Insights", value: "1080x1920/image_life_insights.html", aspect: "9:16" },
    { label: "Life Insights (Light)", value: "1080x1920/image_life_insights_light.html", aspect: "9:16" },
    { label: "Health Preservation", value: "1080x1920/image_health_preservation.html", aspect: "9:16" },
    { label: "Purple", value: "1080x1920/image_purple.html", aspect: "9:16" },
    { label: "Blur Card", value: "1080x1920/image_blur_card.html", aspect: "9:16" },
    { label: "Book Style", value: "1080x1920/image_book.html", aspect: "9:16" },
    { label: "Simple Black", value: "1080x1920/image_simple_black.html", aspect: "9:16" },
    { label: "Simple Line Drawing", value: "1080x1920/image_simple_line_drawing.html", aspect: "9:16" },
    { label: "Psychology Card", value: "1080x1920/image_psychology_card.html", aspect: "9:16" },
    { label: "Satirical Cartoon", value: "1080x1920/image_satirical_cartoon.html", aspect: "9:16" },
    { label: "Long Text", value: "1080x1920/image_long_text.html", aspect: "9:16" },
    { label: "Excerpt", value: "1080x1920/image_excerpt.html", aspect: "9:16" },
    { label: "Video Default", value: "1080x1920/video_default.html", aspect: "9:16" },
    
    // Landscape (16:9) - 1920x1080 templates
    { label: "Film Style (16:9)", value: "1920x1080/image_film.html", aspect: "16:9" },
    { label: "Book Style (16:9)", value: "1920x1080/image_book.html", aspect: "16:9" },
    { label: "Full Image (16:9)", value: "1920x1080/image_full.html", aspect: "16:9" },
    { label: "Ultrawide Minimal (16:9)", value: "1920x1080/image_ultrawide_minimal.html", aspect: "16:9" },
    { label: "Dark Tech (16:9)", value: "1920x1080/image_wide_darktech.html", aspect: "16:9" },
    
    // Square (1:1) - 1080x1080 templates
    { label: "Minimal Framed (1:1)", value: "1080x1080/image_minimal_framed.html", aspect: "1:1" }
];

// Visual style options for prompt_prefix
const VISUAL_STYLE_OPTIONS = [
    { label: "Default (AI decides)", value: "" },
    { label: "Realistic Photo", value: "realistic photo, photorealistic, high detail, professional photography" },
    { label: "Cinematic", value: "cinematic scene, dramatic lighting, film still, movie quality, wide angle" },
    { label: "Documentary", value: "documentary style, authentic, natural lighting, journalistic, candid" },
    { label: "Cartoon/Animation", value: "cartoon style, animated, colorful, playful, illustrated" },
    { label: "Healing/Calm", value: "soft, peaceful, calming, gentle colors, serene, zen" },
    { label: "Minimal/Clean", value: "minimalist, clean design, simple, modern, white space" },
    { label: "Vintage/Retro", value: "vintage style, retro aesthetic, nostalgic, film grain, faded colors" },
    { label: "Fantasy/Dreamy", value: "fantasy, dreamy, ethereal, magical, soft glow, surreal" },
    { label: "Dark/Moody", value: "dark, moody, dramatic shadows, noir style, high contrast" },
    { label: "Watercolor", value: "watercolor painting style, artistic, soft brushstrokes, painted" },
    { label: "3D Render", value: "3D render, CGI, digital art, Pixar style, smooth surfaces" }
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
    visualStyle,
    isInvalid,
    errors,
    isSubmitting,
    taskCompleted,
    onVideoSubjectChange,
    onAspectRatioChange,
    onNScenesChange,
    onFrameTemplateChange,
    onVisualStyleChange,
    onSubmit
}) {
    // Get the current aspect ratio value
    const currentAspect = aspectRatio?.value || "9:16";
    
    // Filter templates by current aspect ratio
    const filteredTemplates = TEMPLATE_OPTIONS.filter(t => t.aspect === currentAspect);
    
    // Auto-select appropriate template when aspect ratio changes
    const handleAspectChange = (newAspect) => {
        onAspectRatioChange(newAspect);
        
        // Find first template matching the new aspect
        const newAspectValue = Object.values(newAspect)[0] || newAspect.value;
        const matchingTemplate = TEMPLATE_OPTIONS.find(t => t.aspect === newAspectValue);
        if (matchingTemplate && onFrameTemplateChange) {
            onFrameTemplateChange(matchingTemplate.value);
        }
    };
    
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VideoDropdown
                    label="Aspect Ratio"
                    selectedItem={aspectRatio}
                    onChange={handleAspectChange}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                    label="Visual Style"
                    placeholder="Select visual style"
                    selectedKeys={[visualStyle || ""]}
                    onChange={(e) => onVisualStyleChange && onVisualStyleChange(e.target.value)}
                    variant="bordered"
                    className="w-full"
                >
                    {VISUAL_STYLE_OPTIONS.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                            {style.label}
                        </SelectItem>
                    ))}
                </Select>
                
                <Select
                    label="Video Template"
                    placeholder="Select template"
                    selectedKeys={[frameTemplate || filteredTemplates[0]?.value || DEFAULT_STUDIO_FRAME_TEMPLATE]}
                    onChange={(e) => onFrameTemplateChange(e.target.value || DEFAULT_STUDIO_FRAME_TEMPLATE)}
                    variant="bordered"
                    className="w-full"
                >
                    {filteredTemplates.map((template) => (
                        <SelectItem key={template.value} value={template.value}>
                            {template.label}
                        </SelectItem>
                    ))}
                </Select>
            </div>
            
            <p className="text-sm text-gray-400">
                AI Video Studio creates videos using AI-generated images and professional narration.
                Describe your video topic, choose a visual style, and let AI handle the visuals and voiceover.
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
