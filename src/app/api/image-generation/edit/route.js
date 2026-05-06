import { b64ToBuffer, buildAzureImageUrl, parseAzureError } from '../_lib/azureImage';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const inbound = await request.formData();
    const image = inbound.get('image');
    const mask = inbound.get('mask');
    const prompt = inbound.get('prompt');

    if (!image || typeof image === 'string') {
      return Response.json({ error: 'Image file is required.' }, { status: 400 });
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return Response.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('image', image, image.name || 'image.png');
    if (mask && typeof mask !== 'string') {
      formData.append('mask', mask, mask.name || 'mask.png');
    }
    formData.append('prompt', prompt.trim());

    const { apiKey, url } = buildAzureImageUrl('edits');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await parseAzureError(response);
      return Response.json({ error: message }, { status: response.status });
    }

    const result = await response.json();
    const b64 = result?.data?.[0]?.b64_json;

    if (!b64) {
      return Response.json({ error: 'Azure image API did not return image data.' }, { status: 502 });
    }

    return new Response(b64ToBuffer(b64), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'inline; filename="edited-image.png"',
      },
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Image editing failed.' }, { status: 500 });
  }
}
