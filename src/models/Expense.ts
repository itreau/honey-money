export interface Expense {
  id: number;
  month_id: number;
  category: string;
  amount: number;
  note: string | null;
  created_at: string;
}
