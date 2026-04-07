import { supabase } from "./client";
import type { Month } from "@/models/Month";
import { getTemplates } from "./template.repo";

export async function getAllMonths(): Promise<Month[]> {
  const { data, error } = await supabase
    .from('months')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as Month[];
}

export async function getSheetsByYearMonth(year: number, month: number): Promise<Month[]> {
  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data as Month[];
}

export async function getMonthByYearMonth(year: number, month: number): Promise<Month | null> {
  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .order('name', { ascending: true })
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as Month | null;
}

export async function getMonthById(id: string): Promise<Month | null> {
  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data as Month | null;
}

export async function createSheet(year: number, month: number, name: string): Promise<Month> {
  const { data, error } = await supabase
    .from('months')
    .insert({ 
      id: crypto.randomUUID(),
      year, 
      month, 
      name 
    })
    .select()
    .single();

  if (error) throw error;
  
  const newMonth = data as Month;
  await applyTemplatesToMonth(newMonth.id);

  return newMonth;
}

export async function getMonthByYearMonthAndName(year: number, month: number, name: string): Promise<Month | null> {
  const { data, error } = await supabase
    .from('months')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .eq('name', name)
    .limit(1)
    .maybeSingle();
  
  if (error) throw error;
  return data as Month | null;
}

export async function createSheetFromPrevious(year: number, month: number, name: string, copyFromMonthId?: string): Promise<Month> {
  const newMonth = await createSheet(year, month, name);

  if (copyFromMonthId) {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('category, budget, amount, note')
      .eq('month_id', copyFromMonthId);
    
    if (error) throw error;

    for (const expense of expenses || []) {
      const { error: insertError } = await supabase
        .from('expenses')
        .insert({
          id: crypto.randomUUID(),
          month_id: newMonth.id,
          ...expense
        });
      
      if (insertError) throw insertError;
    }
  }

  return newMonth;
}

export async function deleteSheet(id: string): Promise<void> {
  const { error: expenseError } = await supabase
    .from('expenses')
    .delete()
    .eq('month_id', id);
  
  if (expenseError) throw expenseError;

  const { error: monthError } = await supabase
    .from('months')
    .delete()
    .eq('id', id);
  
  if (monthError) throw monthError;
}

export async function applyTemplatesToMonth(monthId: string): Promise<void> {
  const templates = await getTemplates();

  for (const template of templates) {
    const { error } = await supabase
      .from('expenses')
      .insert({
        id: crypto.randomUUID(),
        month_id: monthId,
        category: template.category,
        amount: template.default_amount,
        note: template.note
      });
    
    if (error) throw error;
  }
}

export async function getOrCreateMonth(year: number, month: number): Promise<Month> {
  const existingMonth = await getMonthByYearMonth(year, month);

  if (existingMonth) {
    return existingMonth;
  }

  return createSheet(year, month, "Main");
}

export async function getAvailableYears(): Promise<number[]> {
  const { data, error } = await supabase
    .from('months')
    .select('year')
    .order('year', { ascending: false });
  
  if (error) throw error;
  const years = [...new Set(data?.map(row => row.year))];
  return years as number[];
}

export async function monthExists(year: number, month: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('months')
    .select('id')
    .eq('year', year)
    .eq('month', month)
    .limit(1);
  
  if (error) throw error;
  return (data?.length || 0) > 0;
}

export async function countSheetsByYearMonth(year: number, month: number): Promise<number> {
  const { count, error } = await supabase
    .from('months')
    .select('*', { count: 'exact', head: true })
    .eq('year', year)
    .eq('month', month);
  
  if (error) throw error;
  return count || 0;
}