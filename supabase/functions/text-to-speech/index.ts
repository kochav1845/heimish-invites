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
    const { text, voice_id } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const ELEVEN_LABS_API_KEY = Deno.env.get('ELEVEN_LABS_API_KEY');
    
    if (!ELEVEN_LABS_API_KEY) {
      throw new Error('ElevenLabs API key is not configured');
    }

    const voiceId = voice_id || 'pNInz6obpgDQGcFmaJgB'; // Default to 'Adam' voice

    // Log the TTS request
    await logger.info('elevenlabs', 'Text-to-speech request initiated', {
      textLength: text.length,
      voiceId,
      service: 'ElevenLabs'
    }, userEmail, '/functions/v1/text-to-speech');

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || 
        `ElevenLabs API error (${response.status}): ${response.statusText}`
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    const duration = Date.now() - startTime;
    const estimatedCost = text.length * 0.00003; // Rough estimate for ElevenLabs pricing

    // Log successful TTS generation
    await logger.success('elevenlabs', 'Text-to-speech generation successful', {
      textLength: text.length,
      voiceId,
      audioSizeBytes: audioBuffer.byteLength,
      service: 'ElevenLabs'
    }, userEmail, '/functions/v1/text-to-speech', duration, estimatedCost);

    return new Response(
      JSON.stringify({ audio: base64Audio }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Text-to-speech error:', error);
    
    // Log the error
    await logger.error('elevenlabs', 'Text-to-speech generation failed', {
      error: error.message,
      stack: error.stack,
      service: 'ElevenLabs'
    }, userEmail, '/functions/v1/text-to-speech', Date.now() - startTime);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate speech. Please try again later.',
        details: error.stack
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});