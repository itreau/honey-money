export interface Expense {
  id: number;
  month_id: number;
  category: string;
  budget: number;
  amount: number;
  note: string | null;
  created_at: string;
}
