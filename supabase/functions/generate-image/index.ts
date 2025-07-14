import OpenAI from 'npm:openai@4.28.0';
import { Logger, extractUserEmail } from '../_shared/logger.ts';

const logger = new Logger();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  const userEmail = extractUserEmail(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Log the image generation request
    await logger.info('openai', 'Image generation request initiated', {
      promptLength: prompt.length,
      model: 'dall-e-3',
      size: '1536x1024',
      quality: 'high'
    }, userEmail, '/functions/v1/generate-image');

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1536x1024",
      quality: "high",
      response_format: "b64_json"
    });

    const duration = Date.now() - startTime;
    const cost = 0.04; // DALL-E 3 cost per image

    // Log successful generation
    await logger.success('openai', 'Image generation successful', {
      model: 'dall-e-3',
      prompt: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      size: '1536x1024',
      quality: 'high',
      imageGenerated: true
    }, userEmail, '/functions/v1/generate-image', duration, cost);

    return new Response(
      JSON.stringify({ imageBase64: response.data[0].b64_json }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Log the error
    await logger.error('openai', 'Image generation failed', {
      error: error.message,
      stack: error.stack
    }, userEmail, '/functions/v1/generate-image', Date.now() - startTime);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});