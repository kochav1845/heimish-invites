import OpenAI from 'npm:openai@4.28.0';
import { Logger, calculateOpenAICost, extractUserEmail } from '../_shared/logger.ts';
import { corsHeaders } from '../_shared/cors.ts';

const logger = new Logger();

Deno.serve(async (req) => {
  const startTime = Date.now();
  const userEmail = extractUserEmail(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { companyName, companyDescription, projectType } = await req.json();

    // Log the style generation request
    await logger.info('openai', 'Style suggestions request initiated', {
      companyName,
      projectType,
      model: 'gpt-4-turbo-preview'
    }, userEmail, '/functions/v1/generate-style-suggestions');

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'), 
    }); 

    const prompt = `Generate a cohesive style combination for a ${projectType || 'business'} website called "${companyName || 'the company'}". ${companyDescription ? `Company description: ${companyDescription}` : ''}

Please provide:
1. Three colors (primary, secondary, accent) as RGBA objects with values 0-255
2. Two fonts (main for body text, secondary for headlines)

Consider the brand personality and industry when selecting colors and fonts. Make sure the colors work well together and have good contrast.

Available fonts for main (body): Inter, Plus Jakarta Sans, Poppins, DM Sans, Work Sans, Manrope, Space Grotesk, Outfit
Available fonts for secondary (headlines): Michroma, Bebas Neue, Playfair Display, Abril Fatface, Raleway, Oswald, Archivo Black, Anton, Lora

Return ONLY a JSON object in this exact format:
{
  "colors": {
    "primary": {"r": 59, "g": 130, "b": 246, "a": 1},
    "secondary": {"r": 107, "g": 114, "b": 128, "a": 1},
    "accent": {"r": 245, "g": 158, "b": 11, "a": 1}
  },
  "fonts": {
    "main": "Inter",
    "secondary": "Michroma"
  },
  "reasoning": "Brief explanation of why these choices work well together"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a professional brand designer with expertise in color theory and typography. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content?.trim();
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    let styleData;
    try {
      styleData = JSON.parse(responseText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        styleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate the response structure
    if (!styleData.colors || !styleData.fonts) {
      throw new Error('Invalid style data structure');
    }

    // Ensure RGBA values are within valid range
    const validateColor = (color: any) => {
      return {
        r: Math.max(0, Math.min(255, color.r || 0)),
        g: Math.max(0, Math.min(255, color.g || 0)),
        b: Math.max(0, Math.min(255, color.b || 0)),
        a: Math.max(0, Math.min(1, color.a || 1))
      };
    };

    const validatedData = {
      colors: {
        primary: validateColor(styleData.colors.primary),
        secondary: validateColor(styleData.colors.secondary),
        accent: validateColor(styleData.colors.accent)
      },
      fonts: {
        main: styleData.fonts.main || 'Inter',
        secondary: styleData.fonts.secondary || 'Michroma'
      },
      reasoning: styleData.reasoning || 'AI-generated style combination'
    };

    const duration = Date.now() - startTime;
    const inputTokens = completion.usage?.prompt_tokens || 0;
    const outputTokens = completion.usage?.completion_tokens || 0;
    const cost = calculateOpenAICost('gpt-4-turbo-preview', inputTokens, outputTokens);

    // Log successful generation
    await logger.success('openai', 'Style suggestions generated successfully', {
      model: 'gpt-4-turbo-preview',
      companyName,
      projectType,
      inputTokens,
      outputTokens,
      totalTokens: completion.usage?.total_tokens || 0,
      colorsGenerated: Object.keys(validatedData.colors).length,
      fontsGenerated: Object.keys(validatedData.fonts).length
    }, userEmail, '/functions/v1/generate-style-suggestions', duration, cost);

    return new Response(
      JSON.stringify(validatedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    // Log the error
    await logger.error('openai', 'Style suggestions generation failed', {
      error: error.message,
      stack: error.stack
    }, userEmail, '/functions/v1/generate-style-suggestions', Date.now() - startTime);
    
    // Fallback to a default style combination if AI fails
    const fallbackStyle = {
      colors: {
        primary: { r: 99, g: 102, b: 241, a: 1 }, // Indigo
        secondary: { r: 107, g: 114, b: 128, a: 1 }, // Gray
        accent: { r: 245, g: 101, b: 101, a: 1 } // Red
      },
      fonts: {
        main: 'Inter',
        secondary: 'Michroma'
      },
      reasoning: 'Fallback professional style combination'
    };

    return new Response(
      JSON.stringify(fallbackStyle),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});