// Client wrapper for the Next.js image generation API routes.
// Azure OpenAI credentials stay server-side in the app environment file.

async function parseErrorResponse(response, fallback) {
    try {
        const data = await response.json();
        return data?.error || data?.message || fallback;
    } catch {
        return fallback;
    }
}

class ImageGenApi {
    static async generateImage(prompt) {
        const response = await fetch('/api/image-generation/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const message = await parseErrorResponse(response, 'Error generating image.');
            throw new Error(message);
        }

        return response.json();
    }

    static async editImage(file, prompt, mask = null) {
        const formData = new FormData();
        formData.append('image', file);
        if (mask) formData.append('mask', mask);
        formData.append('prompt', prompt);

        const response = await fetch('/api/image-generation/edit', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const message = await parseErrorResponse(response, 'Error editing image.');
            throw new Error(message);
        }

        return response.blob();
    }

    static async fetchImageWithProxy(imageUrl) {
        if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
            const response = await fetch(imageUrl);
            return response.blob();
        }

        try {
            const proxyResponse = await fetch('/api/proxy-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl })
            });

            if (proxyResponse.ok) {
                return await proxyResponse.blob();
            }
            throw new Error('Proxy fetch failed');
        } catch (fetchError) {
            console.warn('Failed to fetch image via proxy, trying direct URL:', fetchError);
            return imageUrl;
        }
    }
}

export default ImageGenApi;
