import { supabase } from "./client";
import type { Pay } from "@/models/Pay";

export async function getLatestPay(): Promise<Pay | null> {
  const { data, error } = await supabase
    .from('pay')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as Pay | null;
}

export async function createPay(amount: number): Promise<Pay> {
  const { data, error } = await supabase
    .from('pay')
    .insert({ amount })
    .select()
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) throw error;
  return data as Pay;
}