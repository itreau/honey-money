-- Create months table
CREATE TABLE IF NOT EXISTS months (
  id BIGSERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  month_id BIGINT NOT NULL REFERENCES months(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  budget DECIMAL(10,2) DEFAULT 0,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pay table
CREATE TABLE IF NOT EXISTS pay (
  id BIGSERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create expense_templates table
CREATE TABLE IF NOT EXISTS expense_templates (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  default_amount DECIMAL(10,2) DEFAULT 0,
  note TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_months_year_month ON months(year, month);
CREATE INDEX IF NOT EXISTS idx_expenses_month_id ON expenses(month_id);
CREATE INDEX IF NOT EXISTS idx_pay_created_at ON pay(created_at DESC);

-- Enable Row Level Security
ALTER TABLE months ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_templates ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict this later based on auth)
CREATE POLICY "Allow all operations on months" ON months FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pay" ON pay FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on expense_templates" ON expense_templates FOR ALL USING (true) WITH CHECK (true);