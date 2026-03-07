import { db } from "./client";
import type { Expense } from "@/models/Expense";

export async function getExpensesByMonthId(monthId: number): Promise<Expense[]> {
  const result = await db.execute({
    sql: "SELECT * FROM expenses WHERE month_id = ?",
    args: [monthId],
  });
  return result.rows as unknown as Expense[];
}

export async function updateExpense(id: number, amount: number): Promise<void> {
  await db.execute({
    sql: "UPDATE expenses SET amount = ? WHERE id = ?",
    args: [amount, id],
  });
}
