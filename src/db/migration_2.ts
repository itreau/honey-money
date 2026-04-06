import { db } from "./client";

await db.execute(
  `ALTER TABLE months ADD COLUMN container TEXT DEFAULT 'default'`
);

await db.execute(
  `DROP INDEX IF EXISTS idx_months_year_month`
);

await db.execute(
  `CREATE UNIQUE INDEX idx_months_year_month_container ON months (year, month, container)`
);

await db.execute(
  `UPDATE months SET container = 'default' WHERE container IS NULL`
);
