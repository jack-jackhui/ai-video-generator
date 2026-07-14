// API route to proxy authenticated video requests
// Prevents token exposure in browser URLs while maintaining security
import { headers } from 'next/headers';

const ENGINE_API_URL = process.env.NEXT_PUBLIC_VIDEO_GEN_API_URL;

// SSRF protection: only allow proxying to configured engine domain
function isAllowedUrl(url) {
    if (!ENGINE_API_URL) return false;
    try {
        const engineHost = new URL(ENGINE_API_URL).hostname;
        const targetHost = new URL(url).hostname;
        return targetHost === engineHost;
    } catch {
        return false;
    }
}

export async function GET(request) {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const videoUrl = searchParams.get('url');
        
        if (!videoUrl) {
            return new Response('Video URL is required', { status: 400 });
        }

        // SSRF protection
        if (!isAllowedUrl(videoUrl)) {
            return new Response('Invalid video URL', { status: 403 });
        }

        // Proxy the request with authentication
        const response = await fetch(videoUrl, {
            headers: {
                'Authorization': authHeader,
                'User-Agent': 'AI-Video-Frontend/1.0',
            },
        });

        if (!response.ok) {
            console.error(`Video fetch failed: ${response.status} ${response.statusText}`);
            return new Response(`Failed to fetch video: ${response.statusText}`, { 
                status: response.status 
            });
        }

        // Stream the video with proper headers
        const contentType = response.headers.get('content-type') || 'video/mp4';
        const contentLength = response.headers.get('content-length');
        
        const responseHeaders = {
            'Content-Type': contentType,
            'Cache-Control': 'private, max-age=3600',
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        };
        
        if (contentLength) {
            responseHeaders['Content-Length'] = contentLength;
        }

        return new Response(response.body, {
            status: 200,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('Proxy video error:', error);
        return new Response(`Proxy error: ${error.message}`, { status: 500 });
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Authorization, Content-Type',
            'Access-Control-Allow-Credentials': 'true',
        },
    });
}
