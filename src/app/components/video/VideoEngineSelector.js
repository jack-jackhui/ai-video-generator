"use client";
import { RadioGroup, Radio } from "@nextui-org/react";

/**
 * VideoEngineSelector - Provider selection for video generation
 * 
 * Options:
 * - default: Stock Video (AI-Video-Engine with Pexels/Pixabay stock footage)
 * - sora: OpenAI Sora 2 (Azure-hosted video generation)
 * - studio: AI Video Studio (Pixelle-derived API with AI-generated images/video)
 */
export default function VideoEngineSelector({ value, onChange }) {
    return (
        <div className="flex w-full justify-left mb-4">
            <RadioGroup
                label="Select Video Engine"
                orientation="horizontal"
                value={value}
                onValueChange={onChange}
            >
                <Radio value="default">Stock Video</Radio>
                <Radio value="sora">OpenAI Sora 2</Radio>
                <Radio value="studio">AI Video Studio</Radio>
            </RadioGroup>
        </div>
    );
}
