import { db } from "./client";
import type { Pay } from "@/models/Pay";

export async function getLatestPay(): Promise<Pay | null> {
  const result = await db.execute({
    sql: "SELECT * FROM pay ORDER BY created_at DESC LIMIT 1",
  });
  return (result.rows[0] as unknown as Pay) || null;
}

export async function createPay(amount: number): Promise<Pay> {
  await db.execute({
    sql: "INSERT INTO pay (amount) VALUES (?)",
    args: [amount],
  });
  
  const result = await db.execute({
    sql: "SELECT * FROM pay ORDER BY created_at DESC LIMIT 1",
  });
  return result.rows[0] as unknown as Pay;
}
