import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');

interface ServiceLog {
  id: string;
  service: 'resend' | 'twilio' | 'supabase';
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details: any;
  user_email?: string;
  endpoint?: string;
  duration?: number;
  cost?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const service = url.searchParams.get('service') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const logs: ServiceLog[] = [];

    // Fetch Resend logs
    if (service === 'all' || service === 'resend') {
      try {
        const resendLogs = await fetchResendLogs(limit);
        logs.push(...resendLogs);
      } catch (error) {
        console.error('Error fetching Resend logs:', error);
        logs.push({
          id: `error-resend-${Date.now()}`,
          service: 'resend',
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Failed to fetch Resend logs',
          details: { error: error.message }
        });
      }
    }

    // Fetch Twilio logs
    if (service === 'all' || service === 'twilio') {
      try {
        const twilioLogs = await fetchTwilioLogs(limit);
        logs.push(...twilioLogs);
      } catch (error) {
        console.error('Error fetching Twilio logs:', error);
        logs.push({
          id: `error-twilio-${Date.now()}`,
          service: 'twilio',
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Failed to fetch Twilio logs',
          details: { error: error.message }
        });
      }
    }

    // Fetch Supabase logs (from our admin_logs table)
    if (service === 'all' || service === 'supabase') {
      try {
        const supabaseLogs = await fetchSupabaseLogs(limit);
        logs.push(...supabaseLogs);
      } catch (error) {
        console.error('Error fetching Supabase logs:', error);
      }
    }

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return new Response(
      JSON.stringify({ 
        logs: logs.slice(0, limit),
        total: logs.length,
        services: {
          resend: logs.filter(l => l.service === 'resend').length,
          twilio: logs.filter(l => l.service === 'twilio').length,
          supabase: logs.filter(l => l.service === 'supabase').length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Service logs error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to fetch service logs',
        logs: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function fetchResendLogs(limit: number): Promise<ServiceLog[]> {
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.data || []).slice(0, limit).map((email: any) => ({
    id: email.id,
    service: 'resend' as const,
    timestamp: email.created_at,
    level: email.last_event === 'delivered' ? 'success' : 
           email.last_event === 'bounced' || email.last_event === 'complained' ? 'error' : 'info',
    message: `Email ${email.last_event || 'sent'}: ${email.subject}`,
    details: {
      to: email.to,
      from: email.from,
      subject: email.subject,
      status: email.last_event,
      html: email.html ? 'HTML content included' : 'Text only',
      reply_to: email.reply_to
    },
    user_email: Array.isArray(email.to) ? email.to[0] : email.to,
    endpoint: '/emails'
  }));
}

async function fetchTwilioLogs(limit: number): Promise<ServiceLog[]> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  // Fetch SMS messages
  const messagesResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json?PageSize=${limit}`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!messagesResponse.ok) {
    throw new Error(`Twilio API error: ${messagesResponse.status} ${messagesResponse.statusText}`);
  }

  const messagesData = await messagesResponse.json();
  const messageLogs: ServiceLog[] = (messagesData.messages || []).map((message: any) => ({
    id: message.sid,
    service: 'twilio' as const,
    timestamp: message.date_created,
    level: message.status === 'delivered' ? 'success' : 
           message.status === 'failed' || message.status === 'undelivered' ? 'error' : 'info',
    message: `SMS ${message.status}: ${message.direction} message`,
    details: {
      to: message.to,
      from: message.from,
      body: message.body?.substring(0, 100) + (message.body?.length > 100 ? '...' : ''),
      status: message.status,
      direction: message.direction,
      price: message.price,
      price_unit: message.price_unit,
      error_code: message.error_code,
      error_message: message.error_message
    },
    user_email: message.to,
    endpoint: '/Messages',
    cost: message.price ? Math.abs(parseFloat(message.price)) : undefined
  }));

  // Fetch call logs
  const callsResponse = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json?PageSize=${Math.min(limit, 20)}`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  let callLogs: ServiceLog[] = [];
  if (callsResponse.ok) {
    const callsData = await callsResponse.json();
    callLogs = (callsData.calls || []).map((call: any) => ({
      id: call.sid,
      service: 'twilio' as const,
      timestamp: call.date_created,
      level: call.status === 'completed' ? 'success' : 
             call.status === 'failed' || call.status === 'busy' || call.status === 'no-answer' ? 'error' : 'info',
      message: `Call ${call.status}: ${call.direction}`,
      details: {
        to: call.to,
        from: call.from,
        status: call.status,
        direction: call.direction,
        duration: call.duration,
        price: call.price,
        price_unit: call.price_unit
      },
      user_email: call.to,
      endpoint: '/Calls',
      duration: call.duration ? parseInt(call.duration) * 1000 : undefined, // Convert to milliseconds
      cost: call.price ? Math.abs(parseFloat(call.price)) : undefined
    }));
  }

  return [...messageLogs, ...callLogs];
}

async function fetchSupabaseLogs(limit: number): Promise<ServiceLog[]> {
  // This would fetch from our internal admin_logs table
  // We'll keep some internal logs for OpenAI and other services we can't fetch externally
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((log: any) => ({
      id: log.id,
      service: log.service,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      details: log.details || {},
      user_email: log.user_email,
      endpoint: log.endpoint,
      duration: log.duration,
      cost: log.cost
    }));
  } catch (error) {
    console.error('Error fetching Supabase logs:', error);
    return [];
  }
}