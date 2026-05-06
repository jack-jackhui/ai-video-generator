const DEFAULT_AZURE_IMAGE_ENDPOINT = 'https://jack-m6wyg7rf-eastus2.openai.azure.com';
const DEFAULT_AZURE_IMAGE_DEPLOYMENT = 'gpt-image-2';
const DEFAULT_AZURE_IMAGE_API_VERSION = '2024-02-01';

export function getAzureImageConfig() {
  const apiKey = process.env.AZURE_API_KEY
    || process.env.AZURE_OPENAI_API_KEY
    || process.env.NEXT_PUBLIC_IMAGE_GEN_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Azure image API key. Set AZURE_API_KEY in the app environment file.');
  }

  const endpoint = (process.env.AZURE_OPENAI_IMAGE_ENDPOINT || DEFAULT_AZURE_IMAGE_ENDPOINT).replace(/\/$/, '');
  const deployment = process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT || DEFAULT_AZURE_IMAGE_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_IMAGE_API_VERSION || DEFAULT_AZURE_IMAGE_API_VERSION;

  return { apiKey, endpoint, deployment, apiVersion };
}

export function buildAzureImageUrl(path) {
  const { apiKey, endpoint, deployment, apiVersion } = getAzureImageConfig();
  return {
    apiKey,
    url: `${endpoint}/openai/deployments/${deployment}/images/${path}?api-version=${apiVersion}`,
  };
}

export function b64ToBuffer(base64) {
  return Buffer.from(base64, 'base64');
}

export async function parseAzureError(response) {
  const fallback = `Azure image API request failed with status ${response.status}`;
  try {
    const body = await response.json();
    return body?.error?.message || body?.message || fallback;
  } catch {
    try {
      return await response.text() || fallback;
    } catch {
      return fallback;
    }
  }
}
