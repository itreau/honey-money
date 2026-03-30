import { useState, useCallback, memo } from "react";
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

const BudgetTableComponent = ({
  expenses,
  loading,
  year,
  month,
  onExpensesChange,
}: BudgetTableProps) => {
  const [copiedExpense, setCopiedExpense] = useState<Expense | null>(null);

  const updateExpense = useCallback(async (
    id: number,
    updates: { category?: string; budget?: number; amount?: number },
  ) => {
    await fetch(`/api/expenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    onExpensesChange(
      expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }, [expenses, onExpensesChange]);

  const deleteExpense = useCallback(async (id: number) => {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });

    onExpensesChange(expenses.filter((e) => e.id !== id));
  }, [expenses, onExpensesChange]);

  const addExpense = useCallback(async () => {
    const res = await fetch(`/api/expenses/add/${year}/${month}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    onExpensesChange([...expenses, data]);
  }, [year, month, expenses, onExpensesChange]);

  const handleCopy = useCallback((expense: Expense) => {
    setCopiedExpense(expense);
  }, []);

  const handlePaste = useCallback(async (targetId: number, sourceExpense: Expense) => {
    const updates = {
      category: sourceExpense.category,
      budget: sourceExpense.budget,
      amount: sourceExpense.amount,
    };
    await updateExpense(targetId, updates);
  }, [updateExpense]);

  const handleClearCopied = useCallback(() => {
    setCopiedExpense(null);
  }, []);

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
              onClearCopied={() => setCopiedExpense(null)}
              hasCopiedExpense={copiedExpense !== null}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default memo(BudgetTableComponent);