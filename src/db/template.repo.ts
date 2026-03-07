import { db } from "./client";
import type { Template } from "@/models/Template";

export async function getTemplates(): Promise<Template[]> {
  const result = await db.execute({
    sql: "SELECT * FROM expense_templates",
  });
  return result.rows as unknown as Template[];
}

export async function createTemplate(category: string, defaultAmount: number, note?: string): Promise<Template> {
  await db.execute({
    sql: "INSERT INTO expense_templates (category, default_amount, note) VALUES (?, ?, ?)",
    args: [category, defaultAmount, note || null],
  });
  
  const result = await db.execute({
    sql: "SELECT * FROM expense_templates WHERE category = ?",
    args: [category],
  });
  return result.rows[0] as unknown as Template;
}
