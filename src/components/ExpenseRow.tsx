import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import type { Expense } from "@/models/Expense";

interface ExpenseRowProps {
  expense: Expense;
  onUpdate: (id: number, updates: { category?: string; budget?: number; amount?: number }) => void;
  onDelete: (id: number) => void;
}

export function ExpenseRow({ expense, onUpdate, onDelete }: ExpenseRowProps) {
  const [category, setCategory] = useState(expense.category);
  const [budget, setBudget] = useState(expense.budget);
  const [amount, setAmount] = useState(expense.amount);

  const remaining = budget - amount;

  async function handleCategoryBlur() {
    if (category !== expense.category) {
      await onUpdate(expense.id, { category });
    }
  }

  async function handleBudgetBlur() {
    if (budget !== expense.budget) {
      await onUpdate(expense.id, { budget });
    }
  }

  async function handleAmountBlur() {
    if (amount !== expense.amount) {
      await onUpdate(expense.id, { amount });
    }
  }

  return (
    <TableRow>
      <TableCell>
        <Input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          onBlur={handleCategoryBlur}
          className="w-32"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          onBlur={handleBudgetBlur}
          className="w-24"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          onBlur={handleAmountBlur}
          className="w-24"
        />
      </TableCell>
      <TableCell className={remaining < 0 ? "text-red-500" : ""}>
        {remaining.toFixed(2)}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this expense? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(expense.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}