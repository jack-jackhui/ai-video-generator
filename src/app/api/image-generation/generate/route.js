import { buildAzureImageUrl, parseAzureError } from '../_lib/azureImage';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = body?.prompt || body?.query;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return Response.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const { apiKey, url } = buildAzureImageUrl('generations');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt.trim(),
        size: body?.size || '1024x1024',
        quality: body?.quality || 'low',
        output_compression: body?.output_compression ?? 100,
        output_format: body?.output_format || 'png',
        n: body?.n || 1,
      }),
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

    return Response.json({
      image_url: `data:image/png;base64,${b64}`,
      revised_prompt: result?.data?.[0]?.revised_prompt,
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Image generation failed.' }, { status: 500 });
  }
}
