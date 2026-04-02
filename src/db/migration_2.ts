import { db } from "./client";

await db.execute(
  `ALTER TABLE months ADD COLUMN name TEXT DEFAULT 'Main'`
);

await db.execute(
  `UPDATE months SET name = 'Main' WHERE name IS NULL`
);