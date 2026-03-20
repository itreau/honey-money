import { db } from "./client";

await db.execute(
  `ALTER TABLE expenses ADD COLUMN budget REAL DEFAULT 0`
);

await db.execute(
  `UPDATE expenses SET budget = 0 WHERE budget IS NULL`
);