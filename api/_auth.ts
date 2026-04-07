import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export type AuthHandler = (
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) => Promise<void | VercelResponse> | Promise<void>;

export async function requireAuth(
  req: VercelRequest,
  res: VercelResponse,
  handler: AuthHandler
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth failed: Missing or invalid authorization header');
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Auth failed: Missing Supabase env vars', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey 
    });
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.log('Auth failed: Token verification error', error.message);
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    if (!user) {
      console.log('Auth failed: No user found');
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    await handler(req, res, user.id);
  } catch (err) {
    console.error('Auth failed: Unexpected error', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function withAuth(handler: AuthHandler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    await requireAuth(req, res, handler);
  };
}