import { db } from "./client";
import type { Month } from "@/models/Month";
import { getTemplates } from "./template.repo";

export async function getAllMonths(): Promise<Month[]> {
  const result = await db.execute({
    sql: "SELECT * FROM months ORDER BY year DESC, month DESC",
  });
  return result.rows as unknown as Month[];
}

export async function getMonthByYearMonth(year: number, month: number): Promise<Month | null> {
  const result = await db.execute({
    sql: "SELECT * FROM months WHERE year = ? AND month = ?",
    args: [year, month],
  });
  return (result.rows[0] as unknown as Month) || null;
}

export async function createMonth(year: number, month: number): Promise<Month> {
  await db.execute({
    sql: "INSERT INTO months (year, month) VALUES (?, ?)",
    args: [year, month],
  });
  
  const newMonth = await getMonthByYearMonth(year, month);
  if (!newMonth) throw new Error("Failed to create month");
  
  return newMonth;
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
  
  const newMonth = await createMonth(year, month);
  await applyTemplatesToMonth(newMonth.id);
  
  return newMonth;
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

export async function createMonthFromPrevious(year: number, month: number): Promise<Month> {
  const newMonth = await createMonth(year, month);

  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = year - 1;
  }

  const prevMonthEntry = await getMonthByYearMonth(prevYear, prevMonth);
  if (prevMonthEntry) {
    const templates = await getTemplates();
    const expenses = await db.execute({
      sql: "SELECT * FROM expenses WHERE month_id = ?",
      args: [prevMonthEntry.id],
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
