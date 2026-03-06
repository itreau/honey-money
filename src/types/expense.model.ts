export interface Expense {
  id?: number;
  category: string;
  amount: number;
  note?: string;
  month: number;
  year: number;
  create_at?: string;
}
