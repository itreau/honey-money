export interface Expense {
  id: string;
  month_id: string;
  category: string;
  budget: number;
  amount: number;
  note: string | null;
  created_at: string;
}
