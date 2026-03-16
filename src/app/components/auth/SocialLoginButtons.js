"use client";
import React from 'react';
import { Button } from "@nextui-org/react";
import { GoogleLogo } from "../Google_logo";
import { AppleLogo } from "../Apple_logo";
import { GitHubLogo } from '../GitHubLogo';
import { MicrosoftLogo } from '../MicrosoftLogo';

export function SocialLoginButtons({
    onGoogleClick,
    onAppleClick,
    onGitHubClick,
    onMicrosoftClick
}) {
    return (
        <div className="flex flex-col gap-4">
            <Button
                startContent={<GoogleLogo />}
                color="secondary"
                auto
                onPress={onGoogleClick}
            >
                Continue with Google
            </Button>
            <Button
                startContent={<AppleLogo />}
                auto
                onPress={onAppleClick}
                color="warning"
                className="text-white"
            >
                Continue with Apple
            </Button>
            <Button
                startContent={<GitHubLogo />}
                color="default"
                auto
                onPress={onGitHubClick}
                className="bg-orange-500 text-white hover:bg-orange-600 border border-orange-400"
            >
                Continue with GitHub
            </Button>
            <Button
                startContent={<MicrosoftLogo />}
                color="primary"
                auto
                onPress={onMicrosoftClick}
                className="bg-blue-600 text-white hover:bg-blue-700"
            >
                Continue with Microsoft
            </Button>
        </div>
    );
}
