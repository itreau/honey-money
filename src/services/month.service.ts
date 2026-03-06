import { createMonth } from "../repositories/month.repository";
import { db } from "../db/client";

export async function createMonthWithTemplates(month: number, year: number) {
  const monthId = await createMonth(month, year);

  await db.execute({
    sql: `
      INSERT INTO expenses (month_id, category, amount, note)
      SELECT ?, category, default_amount, note
      FROM expense_templates
    `,
    args: [monthId],
  });

  return monthId;
}
