import { db } from "../db/client";
export async function createMonth(month: number, year: number) {
  const result = await db.execute({
    sql: "INSERT INTO months (month, year) VALUES (?, ?)",
    args: [month, year],
  });

  return result.lastInsertRowid;
}

export async function getMonth(month: number, year: number) {
  const result = await db.execute({
    sql: "SELECT * FROM months WHERE month = ? AND year = ?",
    args: [month, year],
  });

  return result.rows[0] ?? null;
}
