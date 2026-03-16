import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaceSwapCard, FACE_SWAP_CARDS } from '@/app/components/FaceSwapCard';

// Mock NextUI components
vi.mock('@nextui-org/react', () => ({
    Card: ({ children, ...props }) => React.createElement('div', { 'data-testid': 'card', ...props }, children),
    CardBody: ({ children }) => React.createElement('div', { 'data-testid': 'card-body' }, children),
    CardFooter: ({ children }) => React.createElement('div', { 'data-testid': 'card-footer' }, children),
    CardHeader: ({ children }) => React.createElement('div', { 'data-testid': 'card-header' }, children),
    Image: ({ alt, src }) => React.createElement('img', { alt, src, 'data-testid': 'image' }),
    Button: ({ children, onPress, ...props }) => React.createElement(
        'button',
        { onClick: onPress, 'data-testid': 'button', ...props },
        children
    ),
    Link: ({ children }) => React.createElement('a', null, children)
}));

describe('FaceSwapCard', () => {
    const mockProps = {
        cardKey: 1,
        title: 'Test Title',
        subtitle: 'Test Subtitle',
        videoSrc: 'https://example.com/video',
        videoTitle: 'Test Video',
        onSwapClick: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render card with correct props', () => {
        render(React.createElement(FaceSwapCard, mockProps));

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should render iframe with correct video source', () => {
        render(React.createElement(FaceSwapCard, mockProps));

        const iframe = screen.getByTitle('Test Video');
        expect(iframe).toBeInTheDocument();
        expect(iframe.getAttribute('src')).toBe('https://example.com/video');
    });

    it('should call onSwapClick with cardKey when button is pressed', () => {
        render(React.createElement(FaceSwapCard, mockProps));

        const button = screen.getByTestId('button');
        fireEvent.click(button);

        expect(mockProps.onSwapClick).toHaveBeenCalledWith(1);
    });

    it('should render Face Swap button text', () => {
        render(React.createElement(FaceSwapCard, mockProps));

        expect(screen.getByText('Face Swap')).toBeInTheDocument();
    });
});

describe('FACE_SWAP_CARDS', () => {
    it('should have 4 cards defined', () => {
        expect(FACE_SWAP_CARDS).toHaveLength(4);
    });

    it('should have required properties for each card', () => {
        FACE_SWAP_CARDS.forEach((card) => {
            expect(card).toHaveProperty('key');
            expect(card).toHaveProperty('title');
            expect(card).toHaveProperty('subtitle');
            expect(card).toHaveProperty('videoSrc');
            expect(card).toHaveProperty('videoTitle');
        });
    });

    it('should have unique keys', () => {
        const keys = FACE_SWAP_CARDS.map((card) => card.key);
        const uniqueKeys = [...new Set(keys)];
        expect(uniqueKeys).toHaveLength(FACE_SWAP_CARDS.length);
    });
});
