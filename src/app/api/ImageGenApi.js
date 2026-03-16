// api/ImageGenApi.js
// const WEBHOOK_BASE_URL = 'https://automate.jackhui.com.au/webhook';
// const API_KEY = process.env.NEXT_PUBLIC_IMAGE_GEN_API_KEY;
import { authApi } from './AuthApi';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9090';
const API_BASE_URL = `${backendUrl}/api`;

class ImageGenApi {
    static async generateImage(prompt) {
        try {
            const response = await authApi.post(`${API_BASE_URL}/generate-image/`, { query: prompt }, { headers: { 'Content-Type': 'application/json' } });
            return response.data;
        } catch (error) {
            console.error('Error generating image:', error);
            throw error;
        }
    }

    static async editImage(file, prompt) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('prompt', prompt);
            const response = await authApi.post(`${API_BASE_URL}/edit-image/`, formData, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error('Error editing image:', error);
            throw error;
        }
    }

    static async fetchImageWithProxy(imageUrl) {
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
