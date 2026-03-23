import { useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExpenseRow } from "./ExpenseRow";
import type { Expense } from "@/models/Expense";

interface BudgetTableProps {
  expenses: Expense[];
  loading: boolean;
  year: number | null;
  month: number | null;
  onExpensesChange: (expenses: Expense[]) => void;
}

export default function BudgetTable({
  expenses,
  loading,
  year,
  month,
  onExpensesChange,
}: BudgetTableProps) {
  const [copiedExpense, setCopiedExpense] = useState<Expense | null>(null);

  async function updateExpense(
    id: number,
    updates: { category?: string; budget?: number; amount?: number },
  ) {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    onExpensesChange(
      expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }

  async function deleteExpense(id: number) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });

    onExpensesChange(expenses.filter((e) => e.id !== id));
  }

  async function addExpense() {
    const res = await fetch(`/api/expenses/add/${year}/${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    onExpensesChange([...expenses, data]);
  }

  function handleCopy(expense: Expense) {
    setCopiedExpense(expense);
  }

  async function handlePaste(targetId: number, sourceExpense: Expense) {
    await updateExpense(targetId, {
      category: sourceExpense.category,
      budget: sourceExpense.budget,
      amount: sourceExpense.amount,
    });
    setCopiedExpense(null);
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
              copiedExpense={copiedExpense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
              onCopy={handleCopy}
              onPaste={handlePaste}
              hasCopiedExpense={copiedExpense !== null}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}