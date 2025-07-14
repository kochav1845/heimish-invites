import { createClient } from 'npm:@supabase/supabase-js@2.39.3';
import OpenAI from 'npm:openai@4.28.0';
import { Logger, calculateOpenAICost, extractUserEmail } from '../_shared/logger.ts';

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
    const { companyName, companyTagline, type } = await req.json();

    if (!companyName) {
      throw new Error('Company name is required');
    }

    // Log the description generation request
    await logger.info('openai', 'Description generation request initiated', {
      companyName,
      type,
      model: 'gpt-3.5-turbo'
    }, userEmail, '/functions/v1/generate-description');

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    let prompt;
    if (type === 'tagline') {
      prompt = `Create a compelling and memorable tagline for ${companyName}. The tagline should be concise (max 10 words) and highlight the company's value proposition.`;
    } else {
      prompt = `Write a compelling and professional company description for ${companyName}. Their tagline is "${companyTagline}". The description should be 2-3 sentences long, engaging, and highlight the company's value proposition. Make it sound professional but approachable.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional copywriter who specializes in creating compelling business content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const description = completion.choices[0].message.content?.trim();
    const duration = Date.now() - startTime;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = calculateOpenAICost('gpt-3.5-turbo', inputTokens, outputTokens);

    // Log successful generation
    await logger.success('openai', 'Description generation successful', {
      model: 'gpt-3.5-turbo',
      type,
      companyName,
      inputTokens,
      outputTokens,
      totalTokens: completion.usage?.total_tokens || 0,
      descriptionLength: description?.length || 0
    }, userEmail, '/functions/v1/generate-description', duration, cost);

    return new Response(
      JSON.stringify({ description }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Log the error
    await logger.error('openai', 'Description generation failed', {
      error: error.message,
      stack: error.stack
    }, userEmail, '/functions/v1/generate-description', Date.now() - startTime);
    
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