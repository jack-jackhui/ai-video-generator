// api/ImageGenApi.js
// const WEBHOOK_BASE_URL = 'https://automate.jackhui.com.au/webhook';
// const API_KEY = process.env.NEXT_PUBLIC_IMAGE_GEN_API_KEY;
import { authApi } from './AuthApi';
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9090';
const API_BASE_URL = `${backendUrl}/api`;

class ImageGenApi {
    static async generateImage(prompt) {
        try {
            // Call backend proxy endpoint
            const response = await authApi.post(`${API_BASE_URL}/generate-image/`, { query: prompt }, { headers: { 'Content-Type': 'application/json' } });
            return response.data; // Axios already parsed JSON
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
                //headers: { 'Content-Type': 'multipart/form-data' }
            });
            // For image binary, axios keeps it in response.data as a Blob if we tell it to
            return response.data;
        } catch (error) {
            console.error('Error editing image:', error);
            throw error;
        }
    }
}

export default ImageGenApi;
