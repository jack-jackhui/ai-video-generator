/**
 * Parse image generation API response to extract image URL
 * Handles various response formats from different image generation APIs
 */
export function parseImageResponse(result) {
    if (result?.image_url) {
        return result.image_url;
    }
    if (result?.url) {
        return result.url;
    }
    if (result?.result_url) {
        return result.result_url;
    }
    if (result?.image) {
        return result.image;
    }
    if (result?.data?.url) {
        return result.data.url;
    }
    if (result?.data?.image_url) {
        return result.data.image_url;
    }
    if (typeof result === 'string') {
        return result;
    }
    return null;
}
