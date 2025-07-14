import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

interface LogEntry {
  service: 'openai' | 'twilio' | 'resend' | 'supabase' | 'luma';
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: any;
  user_email?: string;
  endpoint?: string;
  duration?: number;
  cost?: number;
}

export class Logger {
  private supabase;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async log(entry: LogEntry): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('admin_logs')
        .insert([{
          ...entry,
          timestamp: new Date().toISOString()
        }]);

      if (error) {
        console.error('Failed to log to database:', error);
      }
    } catch (error) {
      console.error('Logger error:', error);
    }
  }

  // Helper methods for different log levels
  async info(service: LogEntry['service'], message: string, details?: any, user_email?: string, endpoint?: string, duration?: number): Promise<void> {
    await this.log({ service, level: 'info', message, details, user_email, endpoint, duration });
  }

  async success(service: LogEntry['service'], message: string, details?: any, user_email?: string, endpoint?: string, duration?: number, cost?: number): Promise<void> {
    await this.log({ service, level: 'success', message, details, user_email, endpoint, duration, cost });
  }

  async warning(service: LogEntry['service'], message: string, details?: any, user_email?: string, endpoint?: string, duration?: number): Promise<void> {
    await this.log({ service, level: 'warning', message, details, user_email, endpoint, duration });
  }

  async error(service: LogEntry['service'], message: string, details?: any, user_email?: string, endpoint?: string, duration?: number): Promise<void> {
    await this.log({ service, level: 'error', message, details, user_email, endpoint, duration });
  }
}

// Helper function to calculate OpenAI costs
export function calculateOpenAICost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
    'dall-e-3': { input: 0, output: 0.04 }, // per image
    'dall-e-2': { input: 0, output: 0.02 }, // per image
  };

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  return (inputTokens / 1000 * modelPricing.input) + (outputTokens / 1000 * modelPricing.output);
}

// Helper function to extract user email from request
export function extractUserEmail(req: Request): string | undefined {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return undefined;
    
    // This is a simplified extraction - in a real app you'd decode the JWT
    // For now, we'll return undefined and let the functions handle user identification
    return undefined;
  } catch {
    return undefined;
  }
}