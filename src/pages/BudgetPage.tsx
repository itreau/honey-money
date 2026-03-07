import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import BudgetTable from "@/components/BudgetTable";
import type { Month } from "@/models/Month";
import type { Pay } from "@/models/Pay";

export default function BudgetPage() {
  const [currentMonth, setCurrentMonth] = useState<Month | null>(null);
  const [availableMonths, setAvailableMonths] = useState<Month[]>([]);
  const [currentPay, setCurrentPay] = useState<number>(0);
  const [pendingPay, setPendingPay] = useState<number | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [showPayDialog, setShowPayDialog] = useState(false);

  useEffect(() => {
    initializePage();
  }, []);

  async function initializePage() {
    await fetchAvailableMonths();
    await fetchCurrentMonth();
    await fetchLatestPay();
  }

  async function fetchAvailableMonths() {
    const res = await fetch("/api/months");
    const months = await res.json();
    setAvailableMonths(months);
  }

  async function fetchCurrentMonth() {
    const res = await fetch("/api/months/current", { method: "POST" });
    const month = await res.json();
    setCurrentMonth(month);
  }

  async function fetchLatestPay() {
    const res = await fetch("/api/pay/latest");
    const pay = await res.json();
    if (pay) {
      setCurrentPay(pay.amount);
    }
  }

  async function handleMonthChange(monthId: string) {
    const selectedMonth = availableMonths.find((m) => m.id === parseInt(monthId));
    if (selectedMonth) {
      setCurrentMonth(selectedMonth);
    } else {
      const [year, month] = monthId.split("-").map(Number);
      const res = await fetch(`/api/months/${year}/${month}`);
      const newMonth = await res.json();
      setCurrentMonth(newMonth);
      await fetchAvailableMonths();
    }
  }

  function handlePayChange(value: string) {
    const newPay = parseFloat(value);
    if (!isNaN(newPay) && newPay !== currentPay) {
      setPendingPay(newPay);
      setShowPayDialog(true);
    }
  }

  async function confirmPayChange() {
    if (pendingPay !== null) {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: pendingPay }),
      });
      const newPay = await res.json();
      setCurrentPay(newPay.amount);
      setPendingPay(null);
    }
    setShowPayDialog(false);
  }

  function formatMonth(month: Month): string {
    const date = new Date(month.year, month.month - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  const remainingBudget = currentPay - totalExpenses;

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-end gap-4">
          <div className="w-48">
            <Label htmlFor="month-select">Month</Label>
            <Select
              value={currentMonth?.id?.toString() || ""}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Select month">
                  {currentMonth && formatMonth(currentMonth)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.id} value={month.id.toString()}>
                    {formatMonth(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Label htmlFor="pay-input">Pay</Label>
            <Input
              id="pay-input"
              type="number"
              value={currentPay}
              onChange={(e) => handlePayChange(e.target.value)}
              className="w-24"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetTable
              monthId={currentMonth?.id || null}
              onExpensesChange={setTotalExpenses}
            />
          </CardContent>
        </Card>

        <div className="text-lg font-semibold">
          Remaining Budget: ${remainingBudget.toFixed(2)}
        </div>
      </motion.div>

      <AlertDialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Pay Amount?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new pay entry with ${pendingPay?.toFixed(2)}.
              This will affect future months but not historical data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowPayDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmPayChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
