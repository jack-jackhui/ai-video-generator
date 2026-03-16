"use client";
import { Textarea, Button, Checkbox } from '@nextui-org/react';
import VideoDropdown from '../ui/Dropdown';
import voicesData from '../../videoGen/voice';

const ASPECT_RATIO_OPTIONS = [
    { "Landscape 16:9": "16:9" },
    { "Portrait 9:16": "9:16" }
];

const SUBTITLE_FONT_OPTIONS = [
    { 'STHeitiLight.ttc': 'STHeitiLight.ttc' },
    { 'STHeitiMedium.ttc': 'STHeitiMedium.ttc' }
];

export default function DefaultVideoForm({
    videoSubject,
    videoScript,
    videoTerms,
    aspectRatio,
    audio,
    subtitleFont,
    soundEffects,
    isInvalid,
    errors,
    isSubmitting,
    taskCompleted,
    isScriptGenerating,
    onVideoSubjectChange,
    onAspectRatioChange,
    onAudioChange,
    onSubtitleFontChange,
    onSoundEffectsChange,
    onGenerateScript,
    onGenerateKeywords,
    onSubmit
}) {
    const audioOptions = voicesData.map(voice => ({
        [`${voice.name}-${voice.gender}`]: voice.name
    }));

    return (
        <>
            <Textarea
                isRequired
                key="videoSubject"
                variant="underlined"
                label="Video Subject"
                isInvalid={isInvalid.videoSubject}
                errorMessage={errors.videoSubject}
                labelPlacement="inside"
                placeholder="Enter your video subject - max 150 words."
                value={videoSubject}
                onChange={(e) => onVideoSubjectChange('videoSubject', e.target.value)}
                maxLength={150}
                maxRows={1}
            />
            <div className="flex w-full justify-start">
                <Button
                    variant="bordered"
                    className="bg-transparent shadow-lg font-bold"
                    onPress={onGenerateScript}
                    isLoading={isScriptGenerating}
                >
                    Generate Video Script (optional)
                </Button>
            </div>
            <Textarea
                key="videoScript"
                variant="bordered"
                label="Video Script"
                isInvalid={isInvalid.videoScript}
                errorMessage={errors.videoScript}
                labelPlacement="inside"
                placeholder="Use AI to generate your video script and customise it - max 2000 words. This is optional."
                value={videoScript}
                onChange={(e) => onVideoSubjectChange('videoScript', e.target.value)}
                maxLength={2000}
            />
            <div className="flex w-full justify-start">
                <Button
                    variant="bordered"
                    className="bg-transparent shadow-lg font-bold"
                    onClick={onGenerateKeywords}
                >
                    Generate Video Keywords (optional)
                </Button>
            </div>
            <Textarea
                key="videoKeywords"
                variant="bordered"
                label="Video Keywords"
                isInvalid={isInvalid.videoKeywords}
                errorMessage={errors.videoKeywords}
                labelPlacement="inside"
                placeholder="Generate video keywords. Optional."
                value={videoTerms}
                onChange={(e) => onVideoSubjectChange('videoKeywords', e.target.value)}
                maxLength={100}
                maxRows={1}
            />
            <div className="flex w-full flex-wrap justify-between gap-4 px-8">
                <VideoDropdown
                    label="Aspect Ratio"
                    selectedItem={aspectRatio}
                    onChange={onAspectRatioChange}
                    options={ASPECT_RATIO_OPTIONS}
                />
                <VideoDropdown
                    label="Audio"
                    selectedItem={audio}
                    onChange={onAudioChange}
                    options={audioOptions}
                />
                <VideoDropdown
                    label="Subtitle Font"
                    selectedItem={subtitleFont}
                    onChange={onSubtitleFontChange}
                    options={SUBTITLE_FONT_OPTIONS}
                />
                <Checkbox
                    isSelected={soundEffects}
                    onChange={(e) => onSoundEffectsChange(e.target.checked)}
                    color="primary"
                    size="md"
                >
                    <p>Sound Effects</p>
                </Checkbox>
            </div>
            <Button
                auto
                shadow
                color="warning"
                onClick={onSubmit}
                disabled={isSubmitting || taskCompleted}
            >
                Generate Video
            </Button>
        </>
    );
}
