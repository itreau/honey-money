import { supabase } from '@/db/client';

export async function authFetch(
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = new Headers(init?.headers);
  
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  
  return fetch(input, {
    ...init,
    headers,
  });
}