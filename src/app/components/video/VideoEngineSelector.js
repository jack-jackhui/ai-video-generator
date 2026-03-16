"use client";
import { RadioGroup, Radio } from '@nextui-org/react';

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
                <Radio value="sora">OpenAI Sora</Radio>
            </RadioGroup>
        </div>
    );
}
