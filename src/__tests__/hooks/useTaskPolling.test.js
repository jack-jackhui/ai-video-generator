import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskPolling } from '@/app/hooks/useTaskPolling';

// Mock toast
vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn()
    }
}));

describe('useTaskPolling', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() =>
            useTaskPolling({
                apiUrl: 'http://test.com',
                taskId: null,
            })
        );

        expect(result.current.isLoading).toBe(false);
        expect(result.current.feedbackMessage).toBe('');
        expect(result.current.downloadUrl).toBe('');
        expect(result.current.taskProgress).toBe(0);
    });

    it('should start loading when taskId is set', () => {
        const { result, rerender } = renderHook(
            ({ taskId }) => useTaskPolling({
                apiUrl: 'http://test.com',
                taskId,
            }),
            { initialProps: { taskId: null } }
        );

        expect(result.current.isLoading).toBe(false);

        rerender({ taskId: 'task-123' });

        expect(result.current.isLoading).toBe(true);
    });

    it('should cleanup on unmount', () => {
        const { unmount } = renderHook(() =>
            useTaskPolling({
                apiUrl: 'http://test.com',
                taskId: 'task-123',
            })
        );

        // Should not throw
        expect(() => unmount()).not.toThrow();
    });

    it('should reset task state', () => {
        const { result } = renderHook(() =>
            useTaskPolling({
                apiUrl: 'http://test.com',
                taskId: null,
            })
        );

        act(() => {
            result.current.setFeedbackMessage('test message');
        });

        expect(result.current.feedbackMessage).toBe('test message');

        act(() => {
            result.current.resetTask();
        });

        expect(result.current.feedbackMessage).toBe('');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.downloadUrl).toBe('');
    });

    it('should provide abort controller', () => {
        const { result } = renderHook(() =>
            useTaskPolling({
                apiUrl: 'http://test.com',
                taskId: null,
            })
        );

        const controller = result.current.getAbortController();
        expect(controller).toBeInstanceOf(AbortController);
    });

    it('should allow setting download URL', () => {
        const { result } = renderHook(() =>
            useTaskPolling({
                apiUrl: 'http://test.com',
                taskId: null,
            })
        );

        act(() => {
            result.current.setDownloadUrl('http://example.com/download');
        });

        expect(result.current.downloadUrl).toBe('http://example.com/download');
    });

    it('should start task and set loading state', () => {
        const { result } = renderHook(() =>
            useTaskPolling({
                apiUrl: 'http://test.com',
                taskId: null,
            })
        );

        act(() => {
            result.current.startTask();
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.feedbackMessage).toBe('');
        expect(result.current.downloadUrl).toBe('');
    });
});
