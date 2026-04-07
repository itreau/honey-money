import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/db/database.types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

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
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  await handler(req, res, user.id);
}

export function withAuth(handler: AuthHandler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    await requireAuth(req, res, handler);
  };
}