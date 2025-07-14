import { corsHeaders } from '../_shared/cors.ts';
import { LumaAI } from 'npm:lumaai';
import { Logger } from '../_shared/logger.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const logger = new Logger();

const handleError = (error: any, status = 400) => {
  console.error('Status check error:', {
    message: error.message || 'Unknown error',
    stack: error.stack || 'No stack trace',
    details: error
  });
  
  return new Response(
    JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      status: 'error',
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Status check request received');
    
    // Get generation ID from query string
    const url = new URL(req.url);
    const generationId = url.searchParams.get('generationId');

    if (!generationId) {
      return new Response(
        JSON.stringify({ error: 'Generation ID is required', status: 'error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking status for generation ID: ${generationId}`);
    
    const LUMA_API_KEY = Deno.env.get('LUMA_LABS_API_KEY');
    if (!LUMA_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Video service is not configured', status: 'error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Set up Supabase client for logging if credentials are available
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let supabase;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    }

    // Log the status check request
    await logger.info('luma', 'Checking video generation status', {
      generationId
    });

    const client = new LumaAI({ authToken: LUMA_API_KEY });
    
    // Check generation status with a timeout
    let status;
    try {
      console.log('Fetching generation status from Luma...');
      status = await client.generations.get(generationId);
      console.log(`Generation status: ${status.state}`);
    } catch (statusError) {
      console.error('Error fetching generation status:', statusError);
      
      // Log the error but return a user-friendly message
      if (supabase) {
        await supabase.from('admin_logs').insert({
          service: 'luma',
          level: 'error',
          message: `Error checking generation status: ${statusError.message}`,
          details: { generationId }
        });
      }
      
      return new Response(
        JSON.stringify({
          error: 'Unable to check generation status. The service may be temporarily unavailable.',
          status: 'error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (status.state === "completed") {
      const videoUrl = status.assets.video;
      
      if (!videoUrl) {
        console.error('No video URL in completed generation');
        return new Response(
          JSON.stringify({ 
            error: 'Generation completed but no video URL was returned',
            status: 'error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log successful completion
      await logger.success('luma', 'Video generation completed', {
        generationId,
        status: status.state,
        url: videoUrl
      });
      
      // Also store the result in images table if Supabase client is available
      if (supabase) {
        try {
          await supabase.from('images').insert({
            url: videoUrl,
            type: 'ai',
            prompt: 'Generated video' // Don't have the original prompt here
          });
        } catch (dbError) {
          console.error('Error storing video URL in database:', dbError);
          // Continue anyway as we still have the URL
        }
      }
      
      return new Response(
        JSON.stringify({
          status: 'completed',
          url: videoUrl,
          generationId,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (status.state === "failed") {
      // Log failure
      await logger.error('luma', 'Video generation failed', {
        generationId,
        reason: status.failure_reason || 'Unknown error'
      });
      
      return new Response(
        JSON.stringify({
          status: 'failed',
          reason: status.failure_reason || 'Unknown reason',
          generationId,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Log in-progress status
      await logger.info('luma', 'Video generation in progress', {
        generationId,
        status: status.state
      });
      
      return new Response(
        JSON.stringify({
          status: 'processing',
          state: status.state,
          generationId,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return handleError(error);
  }
});