import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Expense } from "@/models/Expense";

interface ExpenseRowProps {
  expense: Expense;
  onUpdate: (id: number, amount: number) => void;
}

export function ExpenseRow({ expense, onUpdate }: ExpenseRowProps) {
  const [amount, setAmount] = useState(expense.amount);

  async function handleBlur() {
    if (amount !== expense.amount) {
      await onUpdate(expense.id, amount);
    }
  }

  return (
    <TableRow>
      <TableCell>{expense.category}</TableCell>

      <TableCell>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          onBlur={handleBlur}
          className="w-24"
        />
      </TableCell>
      <TableCell>{expense.note}</TableCell>
    </TableRow>
  );
}
