import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_ANON_KEY') || ''
);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { promoCode, productType } = await req.json();

    if (!promoCode) {
      return new Response(
        JSON.stringify({ error: 'Promo code is required' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    // In a real implementation, you would check the database for valid promo codes
    // Here we'll implement a simple mock validation
    // This could be replaced with an actual database lookup in production
    
    // For demonstration purposes, we'll accept some example codes
    const validCodes = {
      'WELCOME20': { discount: 20, validForProducts: ['template_export'] },
      'EXPORT50': { discount: 50, validForProducts: ['template_export'] },
      'SAVE10': { discount: 10, validForProducts: ['template_export'] },
    };

    const normalizedCode = promoCode.toUpperCase();
    const codeInfo = validCodes[normalizedCode];

    if (codeInfo && (!productType || codeInfo.validForProducts.includes(productType))) {
      return new Response(
        JSON.stringify({
          valid: true,
          discount: codeInfo.discount, // Percentage discount
          code: normalizedCode
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Invalid promo code'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 200
        }
      );
    }
  } catch (error) {
    console.error('Error validating promo code:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});