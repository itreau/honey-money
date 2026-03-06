import { db } from "../db/client";

export async function getTemplates() {
  const result = await db.execute("SELECT * FROM expense_templates");
  return result.rows;
}
