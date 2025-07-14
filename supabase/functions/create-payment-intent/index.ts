import { corsHeaders } from '../_shared/cors.ts';
import Stripe from 'npm:stripe@12.3.0';

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY1');
    
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe is not configured. Please provide a valid STRIPE_SECRET_KEY1.' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 500
        }
      );
    }

    // Initialize the real Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16', // Use the latest stable API version
    });

    const { amount, currency = 'usd', metadata = {} } = await req.json();

    if (!amount) {
      return new Response(
        JSON.stringify({ error: 'Amount is required' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
          status: 400
        }
      );
    }

    // Create a real PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure the amount is an integer (in cents)
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Created payment intent:', paymentIntent.id);

    // Return the client secret to the frontend
    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
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
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while creating the payment intent'
      }),
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