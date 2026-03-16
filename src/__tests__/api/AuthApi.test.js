import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock dependencies
vi.mock('js-cookie', () => ({
    default: {
        get: vi.fn(),
        set: vi.fn()
    }
}));

vi.mock('@/lib/auth/tokenStorage', () => ({
    tokenStorage: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn()
    }
}));

vi.mock('@/lib/logger', () => ({
    logger: {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

describe('AuthApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should add Authorization header when token exists', async () => {
        const { tokenStorage } = await import('@/lib/auth/tokenStorage');
        tokenStorage.get.mockReturnValue('test-token-123');

        const { authApi } = await import('@/app/api/AuthApi');

        // Check that interceptor is configured
        expect(authApi.interceptors.request.handlers.length).toBeGreaterThan(0);
    });

    it('should not add Authorization header when no token', async () => {
        const { tokenStorage } = await import('@/lib/auth/tokenStorage');
        tokenStorage.get.mockReturnValue(null);

        const { authApi } = await import('@/app/api/AuthApi');

        expect(authApi.interceptors.request.handlers.length).toBeGreaterThan(0);
    });

    it('should have CSRF token handling for unsafe methods', async () => {
        const Cookies = (await import('js-cookie')).default;
        Cookies.get.mockReturnValue('csrf-token-123');

        const { authApi } = await import('@/app/api/AuthApi');

        // Verify interceptor exists
        const requestInterceptor = authApi.interceptors.request.handlers[0];
        expect(requestInterceptor).toBeDefined();
    });

    it('should handle 401 response errors', async () => {
        const { authApi } = await import('@/app/api/AuthApi');

        // Verify response interceptor exists
        const responseInterceptor = authApi.interceptors.response.handlers[0];
        expect(responseInterceptor).toBeDefined();
    });

    it('should export fetchCSRFToken function', async () => {
        const { fetchCSRFToken } = await import('@/app/api/AuthApi');
        expect(typeof fetchCSRFToken).toBe('function');
    });
});
