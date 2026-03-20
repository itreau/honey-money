import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExpenseRow } from "./ExpenseRow";
import { useEffect, useState } from "react";
import type { Expense } from "@/models/Expense";

interface BudgetTableProps {
  year: number | null;
  month: number | null;
  onExpensesChange?: (total: number) => void;
}

export default function BudgetTable({
  year,
  month,
  onExpensesChange,
}: BudgetTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (year && month) {
      loadExpenses();
    }
  }, [year, month]);

  useEffect(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    onExpensesChange?.(total);
  }, [expenses]);

  async function loadExpenses() {
    setLoading(true);
    try {
      const res = await fetch(`/api/expenses/${year}/${month}`);
      const data = await res.json();
      setExpenses(data);
    } finally {
      setLoading(false);
    }
  }

  async function updateExpense(
    id: number,
    updates: { category?: string; budget?: number; amount?: number },
  ) {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }

  async function deleteExpense(id: number) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });

    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  async function addExpense() {
    const res = await fetch(`/api/expenses/add/${year}/${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    setExpenses((prev) => [...prev, data]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-right">
        <Button onClick={addExpense} variant="outline">
          Add Expense
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Spent</TableHead>
            <TableHead>Remaining</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
