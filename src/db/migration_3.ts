import { db } from "./client";

console.log("Checking and fixing indexes...");

// Check indexes
const indexes = await db.execute({
  sql: "SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='months'",
});
console.log("Current indexes on months table:", JSON.stringify(indexes.rows, null, 2));

// Drop the container index if it exists
try {
  await db.execute(`DROP INDEX IF EXISTS idx_months_year_month_container`);
  console.log("Dropped idx_months_year_month_container");
} catch (e) {
  console.log("Could not drop container index:", e);
}

// Try to create the name index
try {
  await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS idx_months_year_month_name ON months (year, month, name)`);
  console.log("Created idx_months_year_month_name");
} catch (e) {
  console.log("Could not create name index:", e);
}

// Verify
const finalIndexes = await db.execute({
  sql: "SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='months'",
});
console.log("Final indexes:", JSON.stringify(finalIndexes.rows, null, 2));

console.log("Done");