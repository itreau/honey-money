import { db } from "./client";
import type { Month } from "@/models/Month";
import { getTemplates } from "./template.repo";

export async function getAllMonths(): Promise<Month[]> {
  const result = await db.execute({
    sql: "SELECT * FROM months ORDER BY year DESC, month DESC, name ASC",
  });
  return result.rows as unknown as Month[];
}

export async function getSheetsByYearMonth(year: number, month: number): Promise<Month[]> {
  const result = await db.execute({
    sql: "SELECT * FROM months WHERE year = ? AND month = ? ORDER BY name ASC",
    args: [year, month],
  });
  return result.rows as unknown as Month[];
}

export async function getMonthByYearMonth(year: number, month: number): Promise<Month | null> {
  const result = await db.execute({
    sql: "SELECT * FROM months WHERE year = ? AND month = ? ORDER BY name ASC LIMIT 1",
    args: [year, month],
  });
  return (result.rows[0] as unknown as Month) || null;
}

export async function getMonthById(id: number): Promise<Month | null> {
  const result = await db.execute({
    sql: "SELECT * FROM months WHERE id = ?",
    args: [id],
  });
  return (result.rows[0] as unknown as Month) || null;
}

export async function createSheet(year: number, month: number, name: string): Promise<Month> {
  const result = await db.execute({
    sql: "INSERT INTO months (year, month, name) VALUES (?, ?, ?) RETURNING *",
    args: [year, month, name],
  });

  const newMonth = result.rows[0] as unknown as Month;
  if (!newMonth) throw new Error("Failed to create sheet");

  await applyTemplatesToMonth(newMonth.id);

  return newMonth;
}

export async function createSheetFromPrevious(year: number, month: number, name: string, copyFromMonthId?: number): Promise<Month> {
  const newMonth = await createSheet(year, month, name);

  if (copyFromMonthId) {
    const expenses = await db.execute({
      sql: "SELECT * FROM expenses WHERE month_id = ?",
      args: [copyFromMonthId],
    });

    for (const expense of expenses.rows as any[]) {
      await db.execute({
        sql: "INSERT INTO expenses (month_id, category, budget, amount, note) VALUES (?, ?, ?, ?, ?)",
        args: [newMonth.id, expense.category, expense.budget ?? 0, expense.amount ?? 0, expense.note ?? null],
      });
    }
  }

  return newMonth;
}

export async function deleteSheet(id: number): Promise<void> {
  await db.execute({
    sql: "DELETE FROM expenses WHERE month_id = ?",
    args: [id],
  });

  await db.execute({
    sql: "DELETE FROM months WHERE id = ?",
    args: [id],
  });
}

export async function applyTemplatesToMonth(monthId: number): Promise<void> {
  const templates = await getTemplates();

  for (const template of templates) {
    await db.execute({
      sql: "INSERT INTO expenses (month_id, category, amount, note) VALUES (?, ?, ?, ?)",
      args: [monthId, template.category, template.default_amount, template.note],
    });
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
  const result = await db.execute({
    sql: "SELECT DISTINCT year FROM months ORDER BY year DESC",
  });
  return result.rows.map((row) => row.year as number);
}

export async function monthExists(year: number, month: number): Promise<boolean> {
  const result = await db.execute({
    sql: "SELECT id FROM months WHERE year = ? AND month = ?",
    args: [year, month],
  });
  return result.rows.length > 0;
}

export async function countSheetsByYearMonth(year: number, month: number): Promise<number> {
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count FROM months WHERE year = ? AND month = ?",
    args: [year, month],
  });
  return (result.rows[0] as any).count;
}