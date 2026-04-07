import { useState, useCallback, memo } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseRow } from "./ExpenseRow";
import { authFetch } from "@/lib/authFetch";
import type { Expense } from "@/models/Expense";

interface BudgetTableProps {
  expenses: Expense[];
  loading: boolean;
  year: number;
  month: number;
  sheetId: string | null;
  onExpensesChange: (expenses: Expense[]) => void;
}

const BudgetTableComponent = ({
  expenses,
  loading,
  year,
  month,
  sheetId,
  onExpensesChange,
}: BudgetTableProps) => {
  const [copiedExpense, setCopiedExpense] = useState<Expense | null>(null);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const updateExpense = useCallback(async (
    id: string,
    updates: { category?: string; budget?: number; amount?: number },
  ) => {
    await authFetch(`/api/expenses/id/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    onExpensesChange(
      expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  }, [expenses, onExpensesChange]);

  const deleteExpense = useCallback(async (id: string) => {
    await authFetch(`/api/expenses/id/${id}`, { method: "DELETE" });

    onExpensesChange(expenses.filter((e) => e.id !== id));
  }, [expenses, onExpensesChange]);

  const addExpense = useCallback(async () => {
    setIsAddingExpense(true);
    const url = new URL(`/api/expenses/add/${year}/${month}`, window.location.origin);
    if (sheetId) {
      url.searchParams.set("sheetId", sheetId.toString());
    }

    try {
      const res = await authFetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      onExpensesChange([...expenses, data]);
    } finally {
      setIsAddingExpense(false);
    }
  }, [year, month, sheetId, expenses, onExpensesChange]);

  const handleCopy = useCallback((expense: Expense) => {
    setCopiedExpense(expense);
  }, []);

  const handlePaste = useCallback(async (targetId: string, sourceExpense: Expense) => {
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
      <div className="space-y-4">
        <div className="text-right">
          <Skeleton className="h-10 w-28 ml-auto" />
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
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-10 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-right">
        <Button onClick={addExpense} variant="outline" disabled={isAddingExpense}>
          {isAddingExpense ? "Adding..." : "Add Expense"}
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
          {isAddingExpense && (
            <TableRow>
              <TableCell><Skeleton className="h-10 w-32" /></TableCell>
              <TableCell><Skeleton className="h-10 w-24" /></TableCell>
              <TableCell><Skeleton className="h-10 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              <TableCell><Skeleton className="h-10 w-20" /></TableCell>
            </TableRow>
          )}
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              copiedExpense={copiedExpense}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
              onCopy={handleCopy}
              onPaste={handlePaste}
              onClearCopied={handleClearCopied}
              hasCopiedExpense={copiedExpense !== null}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default memo(BudgetTableComponent);