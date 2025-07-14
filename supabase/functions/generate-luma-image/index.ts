import { corsHeaders } from '../_shared/cors.ts';
import { LumaAI } from 'npm:lumaai';

Deno.serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      imageUrl, 
      aspectRatio = '16:9', 
      model = 'photon-1',
      imageWeight = 0.8
    } = await req.json();

    if (!prompt) {
      console.error('Validation error: Prompt is required');
      throw new Error('Prompt is required');
    }

    const LUMA_API_KEY = Deno.env.get('LUMA_LABS_API_KEY');
    if (!LUMA_API_KEY) {
      console.error('Configuration error: Luma API key not found');
      throw new Error('Luma API key is not configured');
    }

    const client = new LumaAI({ authToken: LUMA_API_KEY });
    console.log('Luma client initialized');

    let generation;
    const baseParams = {
      prompt,
      aspect_ratio: aspectRatio,
      model
    };

    if (imageUrl) {
      // Image reference mode
      console.log('Starting image reference generation');
      generation = await client.generations.image.create({
        ...baseParams,
        image_ref: [
          {
            url: imageUrl,
            weight: imageWeight
          }
        ]
      });
    } else {
      // Text to image mode
      console.log('Starting text-to-image generation');
      generation = await client.generations.image.create(baseParams);
    }

    console.log('Generation started:', generation.id);

    // Poll for completion
    const maxMinutes = 5;
    console.log(`Starting generation polling with ${maxMinutes} minutes timeout`);
    let completed = false;
    let attempts = 0;
    const maxAttempts = maxMinutes * 60; // 1-second intervals for more frequent checks
    const pollInterval = 1000; // 1 second

    while (!completed && attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const status = await client.generations.get(generation.id);
      console.log('Generation status:', status.state);

      if (status.state === "completed") {
        console.log('Generation completed successfully');
        generation = status;
        completed = true;
        break;
      } else if (status.state === "failed") {
        console.error('Generation failed:', status.failure_reason);
        throw new Error(`Generation failed: ${status.failure_reason}`);
      } else if (status.state === "processing") {
        console.log('Still processing, continuing to poll...');
        await new Promise(r => setTimeout(r, pollInterval));
        attempts++;
      } else {
        console.log(`Unknown state: ${status.state}, treating as processing`);
        await new Promise(r => setTimeout(r, pollInterval));
        attempts++;
      }
    }

    if (!completed) {
      console.error('Generation timed out');
      throw new Error(`Generation timed out after ${maxMinutes} minutes. Please try again.`);
    }

    const generatedImageUrl = generation.assets.image;
    if (!generatedImageUrl) {
      throw new Error('No image URL returned from generation');
    }

    console.log('Image URL generated:', generatedImageUrl);

    return new Response(
      JSON.stringify({ 
        success: true,
        url: generatedImageUrl,
        generationId: generation.id
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});