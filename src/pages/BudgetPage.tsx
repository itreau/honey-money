import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Label } from "@/components/ui/label";
import { Loader, Check, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import BudgetTable from "@/components/BudgetTable";
import { ExpensesPieChart } from "@/components/ExpensesPieChart";
import type { Expense } from "@/models/Expense";

type Status = "idle" | "saving" | "loading" | "saved" | "error";

export default function BudgetPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [dbYears, setDbYears] = useState<number[]>([]);
  const [monthExists, setMonthExists] = useState<boolean | null>(null);
  const [currentPay, setCurrentPay] = useState<number>(0);
  const [pendingPay, setPendingPay] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [payStatus, setPayStatus] = useState<Status>("idle");

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (selectedYear !== null && selectedMonth !== null) {
      fetchExpenses();
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const allYears = new Set<number>([
      ...dbYears,
      currentYear,
      currentYear - 1,
      currentYear + 1,
    ]);
    setAvailableYears(Array.from(allYears).sort((a, b) => b - a));
  }, [dbYears]);

  async function fetchExpenses() {
    if (selectedYear === null || selectedMonth === null) return;
    setExpensesLoading(true);
    setMonthExists(null);
    try {
      const res = await fetch(
        `/api/expenses/${selectedYear}/${selectedMonth}`,
      );
      const data = await res.json();
      setExpenses(data.expenses);
      setMonthExists(data.monthExists);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function initializePage() {
    await fetchDbYears();
    await fetchCurrentMonth();
    await fetchLatestPay();
  }

  async function fetchDbYears() {
    const res = await fetch("/api/years");
    const years = await res.json();
    setDbYears(years);
  }

  async function fetchCurrentMonth() {
    const res = await fetch("/api/months/current", { method: "POST" });
    const month = await res.json();
    setSelectedYear(month.year);
    setSelectedMonth(month.month);
  }

  async function fetchLatestPay() {
    setPayStatus("loading");
    const res = await fetch("/api/pay/latest");
    const pay = await res.json();
    if (pay) {
      setPayStatus("idle");
      setCurrentPay(pay.amount);
    } else {
      setPayStatus("error");
    }
  }

  function handleYearChange(year: string) {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    setSelectedMonth(null);
    setMonthExists(null);
  }

  function handleMonthChange(month: string) {
    const newMonth = parseInt(month);
    setSelectedMonth(newMonth);
  }

  function handlePayChange() {
    if (
      pendingPay !== null &&
      !isNaN(pendingPay) &&
      pendingPay !== currentPay
    ) {
      setShowPayDialog(true);
    }
  }

  async function confirmPayChange() {
    if (pendingPay !== null) {
      try {
        setPayStatus("saving");
        const res = await fetch("/api/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: pendingPay }),
        });
        const newPay = await res.json();
        setCurrentPay(newPay.amount);
        setPayStatus("saved");
        setTimeout(() => setPayStatus("idle"), 1500);
        setPendingPay(null);
      } catch {
        setPayStatus("error");
      }
    }
    setShowPayDialog(false);
  }

  async function handleCreateFromPrevious() {
    setShowCreateDialog(true);
  }

  async function confirmCreateFromPrevious() {
    if (selectedYear === null || selectedMonth === null) return;
    
    try {
      setIsCreating(true);
      const res = await fetch(
        `/api/months/${selectedYear}/${selectedMonth}/create-from-previous`,
        { method: "POST" }
      );
      const data = await res.json();
      setExpenses(data.expenses);
      setMonthExists(true);
      setDbYears((prev) => {
        if (!prev.includes(selectedYear)) {
          return [...prev, selectedYear].sort((a, b) => b - a);
        }
        return prev;
      });
    } finally {
      setIsCreating(false);
      setShowCreateDialog(false);
    }
  }

  const remainingBudget = currentPay - totalExpenses;

  function formatMonth(month: number): string {
    const date = new Date(2000, month - 1);
    return date.toLocaleDateString("en-US", { month: "long" });
  }

  const monthsInYear = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const showCreateButton = monthExists === false && !expensesLoading;

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-end gap-4">
          <div className="w-32 space-y-2">
            <Label htmlFor="year-select">Year</Label>
            <Select
              value={selectedYear?.toString() || ""}
              onValueChange={handleYearChange}
            >
              <SelectTrigger id="year-select">
                <SelectValue placeholder="Select year">
                  {selectedYear}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40 space-y-2">
            <Label htmlFor="month-select">Month</Label>
            <Select
              value={selectedMonth?.toString() || ""}
              onValueChange={handleMonthChange}
              disabled={selectedYear === null}
            >
              <SelectTrigger id="month-select">
                <SelectValue placeholder="Select month">
                  {selectedMonth && formatMonth(selectedMonth)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {monthsInYear.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {formatMonth(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <div className="space-y-2">
              <Label htmlFor="pay-input">Pay</Label>
              <div className="relative flex items-center gap-2">
                <CurrencyInput
                  id="pay-input"
                  value={pendingPay ?? currentPay}
                  onBlur={handlePayChange}
                  onChange={setPendingPay}
                />

                {(payStatus === "saving" || payStatus === "loading") && (
                  <Loader className="h-4 w-4 animate-spin text-muted-background" />
                )}

                {payStatus === "saved" && (
                  <Check className="h-4 w-4 text-green-500" />
                )}

                {payStatus === "error" && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            {showCreateButton ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <p className="text-muted-foreground text-center">
                  No expense sheet exists for this month.
                </p>
                <Button onClick={handleCreateFromPrevious}>
                  Create Expense Sheet From Previous
                </Button>
              </div>
            ) : (
              <BudgetTable
                expenses={expenses}
                loading={expensesLoading}
                year={selectedYear}
                month={selectedMonth}
                onExpensesChange={setExpenses}
              />
            )}
          </CardContent>
        </Card>

        <ExpensesPieChart expenses={expenses} />

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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={confirmPayChange}
              disabled={payStatus === "saving"}
            >
              {payStatus === "saving" ? "Saving..." : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Expense Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new expense sheet for {selectedMonth && formatMonth(selectedMonth)} {selectedYear} by copying expenses from the previous month. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={confirmCreateFromPrevious} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
