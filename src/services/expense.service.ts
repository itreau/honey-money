import { db } from "../db/client"
import { Expense } from "../models/expense.model"

export async function getExpenses(month: number, year: number): Promise<Expense[]> {
  const result = await db.execute({
    sql:
    `
      SELECT * FROM expenses 
      WHERE month = ? AND year = ?
      ORDER BY created_at
    `,
    args: [month, year],
  })

  return result.rows as Expense[]
}

export async function createExpense(expense: Expense) {
  await db.execute({
    sql:
    `
      INSERT INTO expenses (category, amount, note, month, year)
      VALUES (?, ?, ?, ?, ?)
    `
    args: [
      expense.category,
      expense.amount,
      expense.note ?? null,
      expense.month,
      expense.year.
    ],
  })
}

export async function updateExpense(id: number, amount: number) {
  await db.execute({
    sql: 
    `
      UPDATE expenses SET amount = ? WHERE id = ?
    `,
    args: [
      amount,
      id,
    ]
  })
}
