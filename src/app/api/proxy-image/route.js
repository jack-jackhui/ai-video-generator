// API route to proxy image requests and bypass CORS
export async function POST(request) {
    try {
        const { imageUrl } = await request.json();
        
        if (!imageUrl) {
            return new Response('Image URL is required', { status: 400 });
        }

        // Fetch the image from the external server
        const response = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
                'Accept': 'image/*',
            }
        });

        if (!response.ok) {
            return new Response(`Failed to fetch image: ${response.statusText}`, { 
                status: response.status 
            });
        }

        // Get the image data as blob
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        // Return the image with proper headers
        return new Response(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('Proxy image error:', error);
        return new Response(`Proxy error: ${error.message}`, { status: 500 });
    }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}