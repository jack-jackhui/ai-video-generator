// api/ImageGenApi.js
const WEBHOOK_BASE_URL = 'https://automate.jackhui.com.au/webhook';
const API_KEY = process.env.NEXT_PUBLIC_IMAGE_GEN_API_KEY; // Add this to your .env file

class ImageGenApi {
    static getHeaders() {
        return {
            'Flux-Webhook-Auth': API_KEY,
            'Content-Type': 'application/json'
        };
    }

    static getFormHeaders() {
        return {
            'Flux-Webhook-Auth': API_KEY
        };
    }

    static async generateImage(prompt) {
        try {
            const response = await fetch(`${WEBHOOK_BASE_URL}/flux-image`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ query: prompt })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
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

            const response = await fetch(`${WEBHOOK_BASE_URL}/ai-imagegen`, {
                method: 'POST',
                headers: this.getFormHeaders(),
                body: formData
            });

            if (!response.ok) {
                // For error responses, try to get text first, then parse as JSON if possible
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorText;
                } catch {
                    errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // Return the binary blob for image data
            return await response.blob();
        } catch (error) {
            console.error('Error editing image:', error);
            throw error;
        }
    }
}

export default ImageGenApi;
