import { describe, it, expect } from 'vitest';
import { getProxiedVideoUrl } from '../../lib/videoProxyUtil';

describe('videoProxyUtil', () => {
    describe('getProxiedVideoUrl', () => {
        it('should return empty string for empty input', () => {
            expect(getProxiedVideoUrl('')).toBe('');
            expect(getProxiedVideoUrl(null)).toBe('');
            expect(getProxiedVideoUrl(undefined)).toBe('');
        });

        it('should return same URL if already proxied', () => {
            const proxiedUrl = '/api/proxy-video?url=http://example.com/video.mp4';
            expect(getProxiedVideoUrl(proxiedUrl)).toBe(proxiedUrl);
        });

        it('should return same URL if relative', () => {
            const relativeUrl = '/videos/test.mp4';
            expect(getProxiedVideoUrl(relativeUrl)).toBe(relativeUrl);
        });

        it('should convert absolute URL to proxied URL', () => {
            const originalUrl = 'http://engine.example.com/api/v1/download/video.mp4';
            const result = getProxiedVideoUrl(originalUrl);
            
            expect(result).toContain('/api/proxy-video?url=');
            expect(decodeURIComponent(result.split('url=')[1])).toBe(originalUrl);
        });

        it('should properly encode URLs with special characters', () => {
            const originalUrl = 'http://engine.example.com/video?id=123&token=abc';
            const result = getProxiedVideoUrl(originalUrl);
            
            expect(result).toContain('/api/proxy-video?url=');
            expect(result).toContain(encodeURIComponent('&'));
            expect(result).toContain(encodeURIComponent('?'));
        });
    });
});
