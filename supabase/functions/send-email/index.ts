import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Parse and validate request body
    const { from, name, message } = await req.json();
    
    if (!from || !name || !message) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(from)) {
      throw new Error('Invalid email format');
    }

    // Send email
    const { data, error: resendError } = await resend.emails.send({
      from: 'noreply@stardev.dev',
      to: 'yosef@stardev.dev',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${from})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      
      throw new Error('Failed to send email');
    }

    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});