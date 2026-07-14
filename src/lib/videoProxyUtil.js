/**
 * Video proxy utilities for authenticated video playback and download
 */

/**
 * Convert an engine video URL to a proxied URL that includes authentication
 * @param {string} videoUrl - Direct URL to video on engine server
 * @returns {string} - Proxied URL through frontend API
 */
export function getProxiedVideoUrl(videoUrl) {
    if (!videoUrl) return '';
    
    // Already proxied or relative URL
    if (videoUrl.includes('/api/proxy-video') || !videoUrl.startsWith('http')) {
        return videoUrl;
    }
    
    // Create proxied URL with original URL as query parameter
    const encodedUrl = encodeURIComponent(videoUrl);
    return `/api/proxy-video?url=${encodedUrl}`;
}

/**
 * Fetch video through proxy with authentication
 * Useful for programmatic access (downloads, thumbnails, etc.)
 * @param {string} videoUrl - Direct URL to video on engine server
 * @param {string} token - Auth token
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchProxiedVideo(videoUrl, token) {
    const proxiedUrl = getProxiedVideoUrl(videoUrl);
    
    return fetch(proxiedUrl, {
        headers: {
            'Authorization': `Token ${token}`,
        },
    });
}

export default { getProxiedVideoUrl, fetchProxiedVideo };
