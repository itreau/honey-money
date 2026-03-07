import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseRow } from "./ExpenseRow";
import { useEffect, useState } from "react";
import type { Expense } from "@/models/Expense";

interface BudgetTableProps {
  monthId: number | null;
  onExpensesChange?: (total: number) => void;
}

export default function BudgetTable({ monthId, onExpensesChange }: BudgetTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (monthId) {
      loadExpenses();
    }
  }, [monthId]);

  useEffect(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    onExpensesChange?.(total);
  }, [expenses]);

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses?monthId=${monthId}`);
      const data = await res.json();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }

  async function updateExpense(id: number, amount: number) {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, amount } : e)),
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Spent</TableHead>
          <TableHead>Remaining</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {expenses.map((expense) => (
          <ExpenseRow
            key={expense.id}
            expense={expense}
            onUpdate={updateExpense}
          />
        ))}
      </TableBody>
    </Table>
  );
}
