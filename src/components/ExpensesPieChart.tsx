import { memo, useMemo } from "react";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Expense } from "@/models/Expense";

interface ExpensesPieChartProps {
  expenses: Expense[];
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8B500",
  "#00CED1",
];

const chartConfig = {
  amount: {
    label: "Spent",
  },
};

const ExpensesPieChartComponent = ({ expenses }: ExpensesPieChartProps) => {
  const data = useMemo(
    () =>
      expenses
        .filter((e) => e.amount > 0)
        .map((e, index) => ({
          name: e.category || "Uncategorized",
          value: e.amount,
          fill: COLORS[index % COLORS.length],
        })),
    [expenses]
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No expenses to display
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold">Expense Breakdown</h3>
      <ChartContainer config={chartConfig} className="h-64 w-96">
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="name" />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) =>
              `${name}: $${value.toFixed(2)}`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  );
};

export const ExpensesPieChart = memo(ExpensesPieChartComponent);