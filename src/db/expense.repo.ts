import { db } from "./client";
import type { Expense } from "@/models/Expense";

export async function getExpensesByMonthId(
  monthId: number,
): Promise<Expense[]> {
  const result = await db.execute({
    sql: "SELECT * FROM expenses WHERE month_id = ?",
    args: [monthId],
  });
  return result.rows as unknown as Expense[];
}

export async function updateExpense(
  id: number,
  updates: { budget?: number; amount?: number; category?: string },
): Promise<void> {
  const fields: string[] = [];
  const values: (number | string)[] = [];

  if (updates.budget !== undefined) {
    fields.push("budget = ?");
    values.push(updates.budget);
  }
  if (updates.amount !== undefined) {
    fields.push("amount = ?");
    values.push(updates.amount);
  }
  if (updates.category !== undefined) {
    fields.push("category = ?");
    values.push(updates.category);
  }

  if (fields.length === 0) return;

  await db.execute({
    sql: `UPDATE expenses SET ${fields.join(", ")} WHERE id = ?`,
    args: [...values, id],
  });
}

export async function deleteExpense(id: number): Promise<void> {
  await db.execute({
    sql: "DELETE FROM expenses WHERE id = ?",
    args: [id],
  });
}

export async function addExpense(monthId: number): Promise<Expense> {
  await db.execute({
    sql: "INSERT INTO expenses (month_id, category, budget, amount, note) VALUES (?, '', 0, 0, NULL)",
    args: [monthId],
  });

  const result = await db.execute({
    sql: "SELECT * FROM expenses WHERE rowid = last_insert_rowid()",
    args: [],
  });

  return result.rows[0] as unknown as Expense;
}
