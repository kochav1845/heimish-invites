import { corsHeaders } from '../_shared/cors.ts';
import { LumaAI } from 'npm:lumaai';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

// Regex to detect potential IP addresses in prompts for safety
const IP_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

// Function to sanitize prompt text
function sanitizePrompt(prompt: string): string {
  // Replace any IP-like patterns with a generic placeholder
  return prompt.replace(IP_PATTERN, '[address]');
}

// Improved error handler
const handleError = (error: any, status = 400) => {
  console.error('Function error:', {
    message: error.message || 'Unknown error',
    stack: error.stack || 'No stack trace',
    details: error
  });
  
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      success: false,
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

Deno.serve(async (req) => {
  console.log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed', success: false }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { 
      prompt, 
      imageUrl, 
      generationType = 'text-to-video', 
      aspectRatio = '16:9',
      loop = false
    } = await req.json();

    // Validate required parameters
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required', success: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize prompt to remove potential IP addresses
    const sanitizedPrompt = sanitizePrompt(prompt);
    
    // Log if prompt was sanitized
    if (sanitizedPrompt !== prompt) {
      console.log('Prompt was sanitized to remove potential IP addresses');
    }

    // Check for API key
    const LUMA_API_KEY = Deno.env.get('LUMA_LABS_API_KEY');
    if (!LUMA_API_KEY) {
      console.error('Configuration error: Luma API key not found');
      return new Response(
        JSON.stringify({ error: 'Video generation service is not configured', success: false }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Supabase credentials for logging
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Initialize Luma client
    const client = new LumaAI({ authToken: LUMA_API_KEY });
    console.log('Luma client initialized');

    // Start generation based on type
    console.log(`Starting ${generationType} generation with prompt:`, sanitizedPrompt.substring(0, 50) + (sanitizedPrompt.length > 50 ? '...' : ''));
    
    // Prepare generation parameters
    let generationParams: any = {
      prompt: sanitizedPrompt,
      model: "ray-2",  // Using latest model
      resolution: "720p",
      duration: "5s"  // Default duration
    };
    
    // Add type-specific parameters
    if (generationType === 'image-to-video' && imageUrl) {
      console.log('Using image URL:', imageUrl);
      generationParams.image_ref = [
        {
          url: imageUrl,
          weight: 0.8  // Default weight for image influence
        }
      ];
    }
    
    // Handle aspect ratio
    if (aspectRatio) {
      // Convert common aspect ratio formats to what Luma expects
      switch(aspectRatio) {
        case '16:9':
          generationParams.aspect_ratio = '16:9';
          break;
        case '9:16':
          generationParams.aspect_ratio = '9:16';
          break;
        case '1:1':
          generationParams.aspect_ratio = 'square';
          break;
        case '4:3':
          generationParams.aspect_ratio = '4:3';
          break;
        default:
          generationParams.aspect_ratio = '16:9'; // Default
      }
    }
    
    // Start the generation
    let generation;
    try {
      generation = await client.generations.create(generationParams);
      console.log('Generation started with ID:', generation.id);
      
      // Immediately return the generation ID without waiting
      console.log('Returning generation ID to client for polling');
      
      // Log to Supabase - store the generation request
      if (supabase) {
        try {
          await supabase.from('admin_logs').insert({
            service: 'luma',
            level: 'info',
            message: `Video generation started: ${generationType}`,
            details: { 
              promptLength: sanitizedPrompt.length,
              generationId: generation.id,
              generationType
            }
          });
        } catch (logError) {
          console.error('Error logging to Supabase:', logError);
        }
      }
      
      return new Response(
        JSON.stringify({
          generationId: generation.id,
          inProgress: true,
          success: true,
          message: "Generation started successfully. Please poll for status updates."
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (genError) {
      console.error('Error starting generation:', genError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to start video generation: ${genError.message || 'API error'}`, 
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    return handleError(error);
  }
});