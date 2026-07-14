import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, OPTIONS } from '../../app/api/proxy-video/route';

// Mock Next.js headers
vi.mock('next/headers', () => ({
    headers: vi.fn(),
}));

// Mock environment variable
process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL = 'http://engine.example.com:8080';

describe('Video Proxy API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    describe('GET /api/proxy-video', () => {
        it('should reject requests without authorization', async () => {
            const { headers } = await import('next/headers');
            headers.mockResolvedValue({
                get: vi.fn(() => null),
            });

            const request = new Request('http://localhost:3000/api/proxy-video?url=http://engine.example.com:8080/video.mp4');
            const response = await GET(request);

            expect(response.status).toBe(401);
            expect(await response.text()).toBe('Unauthorized');
        });

        it('should reject requests without video URL', async () => {
            const { headers } = await import('next/headers');
            headers.mockResolvedValue({
                get: vi.fn((key) => key === 'authorization' ? 'Token test123' : null),
            });

            const request = new Request('http://localhost:3000/api/proxy-video');
            const response = await GET(request);

            expect(response.status).toBe(400);
            expect(await response.text()).toBe('Video URL is required');
        });

        it('should reject SSRF attempts (wrong domain)', async () => {
            const { headers } = await import('next/headers');
            headers.mockResolvedValue({
                get: vi.fn((key) => key === 'authorization' ? 'Token test123' : null),
            });

            const request = new Request('http://localhost:3000/api/proxy-video?url=http://evil.com/video.mp4');
            const response = await GET(request);

            expect(response.status).toBe(403);
            expect(await response.text()).toBe('Invalid video URL');
        });

        it('should proxy valid authenticated requests', async () => {
            const { headers } = await import('next/headers');
            headers.mockResolvedValue({
                get: vi.fn((key) => {
                    if (key === 'authorization') return 'Token test123';
                    if (key === 'origin') return 'http://localhost:3000';
                    return null;
                }),
            });

            const mockVideoBlob = new Blob(['fake video data'], { type: 'video/mp4' });
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: (key) => {
                        if (key === 'content-type') return 'video/mp4';
                        if (key === 'content-length') return '1024';
                        return null;
                    },
                },
                body: mockVideoBlob.stream(),
            });

            const request = new Request('http://localhost:3000/api/proxy-video?url=http://engine.example.com:8080/video.mp4');
            request.headers = { get: () => 'http://localhost:3000' };
            const response = await GET(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('content-type')).toBe('video/mp4');
            expect(global.fetch).toHaveBeenCalledWith(
                'http://engine.example.com:8080/video.mp4',
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': 'Token test123',
                    }),
                })
            );
        });

        it('should handle backend errors gracefully', async () => {
            const { headers } = await import('next/headers');
            headers.mockResolvedValue({
                get: vi.fn((key) => key === 'authorization' ? 'Token test123' : null),
            });

            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            const request = new Request('http://localhost:3000/api/proxy-video?url=http://engine.example.com:8080/missing.mp4');
            const response = await GET(request);

            expect(response.status).toBe(404);
            expect(await response.text()).toContain('Failed to fetch video');
        });
    });

    describe('OPTIONS /api/proxy-video', () => {
        it('should return CORS headers', async () => {
            const request = new Request('http://localhost:3000/api/proxy-video', {
                method: 'OPTIONS',
            });
            request.headers = { get: () => 'http://localhost:3000' };
            
            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('access-control-allow-methods')).toContain('GET');
            expect(response.headers.get('access-control-allow-headers')).toContain('Authorization');
        });
    });
});
