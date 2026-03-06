import { db } from "../db/client";
import { Expense } from "../models/expense";

export async function getExpensesByMonth(monthId: number): Promise<Expense[]> {
  const result = await db.execute({
    sql: "SELECT * FROM expenses WHERE month_id = ? ORDER BY created_at",
    args: [monthId],
  });

  return result.rows as Expense[];
}

export async function createExpense(expense: Expense) {
  await db.execute({
    sql: `
      INSERT INTO expenses (month_id, category, amount, note)
      VALUES (?, ?, ?, ?)
    `,
    args: [
      expense.month_id,
      expense.category,
      expense.amount,
      expense.note ?? null,
    ],
  });
}

export async function updateExpenseAmount(id: number, amount: number) {
  await db.execute({
    sql: "UPDATE expenses SET amount = ? WHERE id = ?",
    args: [amount, id],
  });
}
