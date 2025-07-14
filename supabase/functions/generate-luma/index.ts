import { LumaAI } from 'npm:lumaai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, X-Requested-With, Content-Type, Accept',
};

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
    const { type, prompt, aspectRatio = '16:9' } = await req.json();
    console.log('Request body:', { type, prompt, aspectRatio });

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
    if (type === 'video') {
      console.log('Starting video generation');
      generation = await client.generations.create({
        prompt,
        model: "ray-2",
        resolution: "720p",
        duration: "5s"
      });
    } else {
      console.log('Starting image generation');
      generation = await client.generations.image.create({
        prompt,
        aspect_ratio: aspectRatio,
        model: "photon-1"
      });
    }

    // Common polling function for both image and video
    const pollGeneration = async (maxMinutes: number) => {
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

      return generation;
    };

    // Poll with different timeouts based on content type
    if (type === 'video') {
      await pollGeneration(30); // 30 minutes for video
    } else {
      await pollGeneration(5); // 5 minutes for image
    }

    const url = type === 'video' ? generation.assets.video : generation.assets.image;
    
    if (!url) {
      throw new Error('No URL returned from generation');
    }

    const responseData = { url };
    console.log('Sending successful response:', responseData);

    return new Response(
      JSON.stringify(responseData),
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