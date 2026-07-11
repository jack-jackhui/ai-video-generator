import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useVideoGenForm } from '@/app/hooks/useVideoGenForm';

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
    },
}));

describe('useVideoGenForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('validates Sora without requiring stock-video audio', () => {
        const { result } = renderHook(() => useVideoGenForm());

        act(() => {
            result.current.handleChange('videoSubject', 'A moonlit train crossing the Alps');
        });

        expect(result.current.validateForm('sora')).toBe(true);
        expect(toast.error).not.toHaveBeenCalled();
        expect(result.current.validateForm('default')).toBe(false);
        expect(toast.error).toHaveBeenCalledWith('Please select an audio option.');
    });

    it('preserves the /api/v1/videos payload contract for Azure Sora 2 routing', () => {
        const { result } = renderHook(() => useVideoGenForm());

        act(() => {
            result.current.handleChange('videoSubject', 'A moonlit train crossing the Alps');
            result.current.setAspectRatio({ label: 'Landscape 16:9', value: '16:9' });
        });

        expect(result.current.getFormData('sora')).toEqual({
            video_subject: 'A moonlit train crossing the Alps',
            video_script: '',
            video_terms: '',
            video_aspect: '16:9',
            video_source: 'sora',
            video_clip_duration: 5,
            video_count: 1,
            video_language: '',
            voice_name: '',
            bgm_type: 'random',
            bgm_file: '',
            bgm_volume: 0.2,
            subtitle_enabled: true,
            subtitle_position: 'bottom',
            font_name: '',
            text_fore_color: '#FFFFFF',
            text_background_color: 'transparent',
            font_size: 60,
            stroke_color: '#000000',
            stroke_width: 2,
            n_threads: 2,
            paragraph_number: 1,
        });
    });

    it('keeps stock and Studio payloads unchanged', () => {
        const { result } = renderHook(() => useVideoGenForm());

        act(() => {
            result.current.handleChange('videoSubject', 'A product launch');
            result.current.setAspectRatio({ label: 'Portrait 9:16', value: '9:16' });
        });

        expect(result.current.getFormData('default').video_source).toBe('default');
        expect(result.current.getFormData('studio')).toEqual({
            text: 'A product launch',
            video_aspect: '9:16',
            mode: 'generate',
        });
    });
});
