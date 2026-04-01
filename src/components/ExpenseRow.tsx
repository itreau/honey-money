import { useState, useEffect, useRef, memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/CurrencyInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, Copy, Check } from "lucide-react";
import type { Expense } from "@/models/Expense";

interface ExpenseRowProps {
  expense: Expense;
  copiedExpense: Expense | null;
  onUpdate: (
    id: number,
    updates: { category?: string; budget?: number; amount?: number },
  ) => void;
  onDelete: (id: number) => void;
  onCopy: (expense: Expense) => void;
  onPaste: (targetId: number, sourceExpense: Expense) => void;
  onClearCopied: () => void;
  hasCopiedExpense: boolean;
}

const ExpenseRowComponent = ({
  expense,
  copiedExpense,
  onUpdate,
  onDelete,
  onCopy,
  onPaste,
  onClearCopied,
  hasCopiedExpense,
}: ExpenseRowProps) => {
  const [category, setCategory] = useState(expense.category);
  const [budget, setBudget] = useState(expense.budget);
  const [amount, setAmount] = useState(expense.amount);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const prevExpenseRef = useRef(expense);

  useEffect(() => {
    if (
      prevExpenseRef.current.id !== expense.id ||
      prevExpenseRef.current.category !== expense.category ||
      prevExpenseRef.current.budget !== expense.budget ||
      prevExpenseRef.current.amount !== expense.amount
    ) {
      setCategory(expense.category);
      setBudget(expense.budget);
      setAmount(expense.amount);
      prevExpenseRef.current = expense;
    }
  }, [expense]);

  const remaining = budget - amount;

  async function confirmPaste() {
    if (copiedExpense) {
      await onPaste(expense.id, copiedExpense);
      onClearCopied();
    }
    setShowPasteDialog(false);
  }

  async function confirmDelete() {
    await onDelete(expense.id);
    setShowDeleteDialog(false);
  }

  function handleRowClick(e: React.MouseEvent) {
    if (hasCopiedExpense && copiedExpense?.id !== expense.id) {
      setShowPasteDialog(true);
    }
  }

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
    <>
      <TableRow
        className={
          hasCopiedExpense && copiedExpense?.id !== expense.id
            ? "cursor-pointer hover:bg-muted/50"
            : ""
        }
        onClick={(e) => {
          e.stopPropagation();
          handleRowClick(e);
        }}
      >
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
          <CurrencyInput
            value={budget}
            onChange={(value: number) => setBudget(value)}
            onBlur={handleBudgetBlur}
            className="w-24"
          />
        </TableCell>
        <TableCell>
          <CurrencyInput
            value={amount}
            onChange={(value: number) => setAmount(value)}
            onBlur={handleAmountBlur}
            className="w-24"
          />
        </TableCell>
        <TableCell className={remaining < 0 ? "text-red-500" : ""}>
          {remaining.toFixed(2)}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(expense);
                setShowCopiedFeedback(true);
                setTimeout(() => setShowCopiedFeedback(false), 2000);
              }}
            >
              {showCopiedFeedback ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paste Expense Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will overwrite the current expense with the copied data
              (Category: {copiedExpense?.category}, Budget: $
              {copiedExpense?.budget?.toFixed(2)}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPaste}>Paste</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export const ExpenseRow = memo(ExpenseRowComponent);
