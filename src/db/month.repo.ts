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
