import { supabase } from "./client";
import type { Expense } from "@/models/Expense";
import { getMonthByYearMonth } from "./month.repo";

export async function getExpensesByMonthId(
  monthId: number,
): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('month_id', monthId);
  
  if (error) throw error;
  return data as Expense[];
}

export async function updateExpense(
  id: number,
  updates: { budget?: number; amount?: number; category?: string },
): Promise<void> {
  const updateData: any = {};
  
  if (updates.budget !== undefined) updateData.budget = updates.budget;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.category !== undefined) updateData.category = updates.category;

  if (Object.keys(updateData).length === 0) return;

  const { error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteExpense(id: number): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function addExpense(monthId: number, data?: { category?: string; budget?: number }): Promise<Expense> {
  const category = data?.category ?? "";
  const budget = data?.budget ?? 0;

  const { data: result, error } = await supabase
    .from('expenses')
    .insert({
      month_id: monthId,
      category,
      budget,
      amount: 0,
      note: null
    })
    .select()
    .single();

  if (error) throw error;
  return result as Expense;
}

export async function getPreviousMonthExpenses(year: number, month: number): Promise<Expense[]> {
  let prevYear = year;
  let prevMonth = month - 1;

  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  const prevMonthEntry = await getMonthByYearMonth(prevYear, prevMonth);
  if (!prevMonthEntry) {
    return [];
  }

  return getExpensesByMonthId(prevMonthEntry.id);
}