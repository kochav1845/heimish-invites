const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, Accept',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain) {
      throw new Error('Domain name is required');
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      throw new Error('Invalid domain format');
    } 

    const API_KEY = Deno.env.get('GODADDY_API_KEY');
    const API_SECRET = Deno.env.get('GODADDY_API_SECRET');

    if (!API_KEY || !API_SECRET) {
      throw new Error('GoDaddy API credentials not configured');
    }

    const response = await fetch(
      `https://api.godaddy.com/v1/domains/available?domain=${domain}`,
      {
        headers: {
          'Authorization': `sso-key ${API_KEY}:${API_SECRET}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GoDaddy API error: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Domain check error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to check domain availability'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});