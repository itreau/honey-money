import { supabase } from "./client";
import type { Template } from "@/models/Template";

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from('expense_templates')
    .select('*');
  
  if (error) throw error;
  return data as Template[];
}

export async function createTemplate(category: string, defaultAmount: number, note?: string): Promise<Template> {
  const { data, error } = await supabase
    .from('expense_templates')
    .insert({
      category,
      default_amount: defaultAmount,
      note: note || null
    })
    .select()
    .limit(1)
    .single();
  
  if (error) throw error;
  return data as Template;
}