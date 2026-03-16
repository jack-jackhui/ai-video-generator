"use client";
import { Textarea, Button } from '@nextui-org/react';

export default function GenerateTab({ prompt, setPrompt, onSubmit, isLoading }) {
    return (
        <>
            <Textarea
                label="Prompt"
                labelPlacement="outside"
                placeholder="Describe the image you want to generate..."
                minRows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                variant="bordered"
                color="warning"
            />
            <div className="flex items-center justify-center gap-3">
                <Button color="warning" isLoading={isLoading} onPress={onSubmit}>
                    Generate Image
                </Button>
            </div>
        </>
    );
}
