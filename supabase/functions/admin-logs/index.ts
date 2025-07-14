import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

interface LogEntry {
  id: string;
  service: 'openai' | 'twilio' | 'resend' | 'supabase';
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  user?: string;
  endpoint?: string;
  duration?: number;
  cost?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'GET') {
      // Get logs with optional filtering
      const url = new URL(req.url);
      const service = url.searchParams.get('service');
      const level = url.searchParams.get('level');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let query = supabase
        .from('admin_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (service && service !== 'all') {
        query = query.eq('service', service);
      }

      if (level && level !== 'all') {
        query = query.eq('level', level);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ logs: data || [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'POST') {
      // Add a new log entry
      const logEntry: Omit<LogEntry, 'id'> = await req.json();

      const { data, error } = await supabase
        .from('admin_logs')
        .insert([{
          ...logEntry,
          timestamp: logEntry.timestamp || new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, log: data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin logs error:', error);
    
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