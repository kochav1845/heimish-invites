import { corsHeaders } from '../_shared/cors.ts';

// Initialize Stripe with your secret key
const stripe = Deno.env.get('STRIPE_SECRET_KEY') 
  ? {
      paymentIntents: {
        update: async (id: string, options: any) => {
          // Here we're creating a mock implementation for local development
          // This would use the real Stripe API in production
          console.log(`Updating payment intent ${id}:`, options);
          return {
            id,
            amount: options.amount,
            status: 'requires_payment_method',
          };
        }
      }
    }
  : null;

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!stripe) {
      return new Response(
        JSON.stringify({ error: 'Stripe is not configured' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 500
        }
      );
    }

    const { paymentIntentId, amount } = await req.json();

    if (!paymentIntentId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Payment intent ID and amount are required' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    // Update the PaymentIntent with the new amount
    const paymentIntent = await stripe.paymentIntents.update(
      paymentIntentId,
      { amount }
    );

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error updating payment intent:', error);
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