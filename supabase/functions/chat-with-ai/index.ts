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
    const { message, context } = await req.json();

    // Log the chat request
    await logger.info('openai', 'Chat completion request initiated', {
      messageLength: message?.length || 0,
      contextLength: context?.length || 0,
      model: 'gpt-4-turbo-preview'
    }, userEmail, '/functions/v1/chat-with-ai');

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant with expertise in software development, web technologies, and digital solutions. Provide clear, accurate, and professional responses."
        },
        ...(context || []),
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const duration = Date.now() - startTime;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = calculateOpenAICost('gpt-4-turbo-preview', inputTokens, outputTokens);

    // Log successful completion
    await logger.success('openai', 'Chat completion successful', {
      model: 'gpt-4-turbo-preview',
      inputTokens,
      outputTokens,
      totalTokens: completion.usage?.total_tokens || 0,
      responseLength: completion.choices[0].message.content?.length || 0
    }, userEmail, '/functions/v1/chat-with-ai', duration, cost);

    return new Response(
      JSON.stringify({ response: completion.choices[0].message.content }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Log the error
    await logger.error('openai', 'Chat completion failed', {
      error: error.message,
      stack: error.stack
    }, userEmail, '/functions/v1/chat-with-ai', Date.now() - startTime);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});