import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Label } from "@/components/ui/label";
import { Loader, Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BudgetTable from "@/components/BudgetTable";
import { ExpensesPieChart } from "@/components/ExpensesPieChart";
import type { Expense } from "@/models/Expense";

type Status = "idle" | "saving" | "loading" | "saved" | "error";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function formatMonth(month: number): string {
  const date = new Date(2000, month - 1);
  return date.toLocaleDateString("en-US", { month: "long" });
}

export default function BudgetPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [monthExists, setMonthExists] = useState<boolean | null>(null);
  const [currentPay, setCurrentPay] = useState<number>(0);
  const [pendingPay, setPendingPay] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [payStatus, setPayStatus] = useState<Status>("idle");

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const remainingBudget = currentPay - totalExpenses;

  const handleExpensesChange = useCallback((newExpenses: Expense[]) => {
    setExpenses(newExpenses);
  }, []);

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (selectedYear !== null && selectedMonth !== null) {
      fetchExpenses();
    }
  }, [selectedYear, selectedMonth]);

  const handleYearChange = useCallback((direction: "prev" | "next") => {
    if (selectedYear === null) return;
    const newYear = direction === "next" ? selectedYear + 1 : selectedYear - 1;
    const currentMonth = new Date().getMonth() + 1;
    setSelectedYear(newYear);
    setSelectedMonth(currentMonth);
    setMonthExists(null);
  }, [selectedYear]);

  const handleYearSelect = useCallback((year: string) => {
    const newYear = parseInt(year);
    if (newYear !== selectedYear) {
      const currentMonth = new Date().getMonth() + 1;
      setSelectedYear(newYear);
      setSelectedMonth(currentMonth);
      setMonthExists(null);
    }
  }, [selectedYear]);

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(parseInt(month));
  }, []);

  async function fetchExpenses() {
    if (selectedYear === null || selectedMonth === null) return;
    setExpensesLoading(true);
    setMonthExists(null);
    try {
      const res = await fetch(`/api/expenses/${selectedYear}/${selectedMonth}`);
      const data = await res.json();
      setExpenses(data.expenses);
      setMonthExists(data.monthExists);
    } finally {
      setExpensesLoading(false);
    }
  }

  async function initializePage() {
    await fetchCurrentMonth();
    await fetchLatestPay();
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
    } finally {
      setIsCreating(false);
      setShowCreateDialog(false);
    }
  }

  const showCreateButton = monthExists === false && !expensesLoading;

  const displayedYears = useMemo(() => {
    if (selectedYear === null) return [];
    const currentYear = new Date().getFullYear();
    const years = new Set([selectedYear - 1, selectedYear, selectedYear + 1, currentYear]);
    return Array.from(years).sort((a, b) => a - b);
  }, [selectedYear]);

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4">
          <Tabs
            value={selectedYear?.toString() || ""}
            onValueChange={handleYearSelect}
            className="w-full"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleYearChange("prev")}
                disabled={selectedYear === null}
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <TabsList className="flex-1">
                {displayedYears.map((year) => (
                  <TabsTrigger
                    key={year}
                    value={year.toString()}
                    className="flex-1"
                  >
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleYearChange("next")}
                disabled={selectedYear === null}
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Tabs>

          <div className="w-48 space-y-2">
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
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {formatMonth(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              Monthly Budget
              {selectedYear !== null && selectedMonth !== null && (
                <span className="ml-2 text-muted-foreground font-normal">
                  - {formatMonth(selectedMonth)} {selectedYear}
                </span>
              )}
            </CardTitle>
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
                onExpensesChange={handleExpensesChange}
              />
            )}
          </CardContent>
        </Card>

        <ExpensesPieChart expenses={expenses} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="pay-input-bottom" className="text-lg font-semibold">
              Pay:
            </Label>
            <div className="relative flex items-center gap-2">
              <CurrencyInput
                id="pay-input-bottom"
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

          <div className="text-lg font-semibold">
            Remaining Budget: ${remainingBudget.toFixed(2)}
          </div>
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
              This will create a new expense sheet for{" "}
              {selectedMonth && formatMonth(selectedMonth)} {selectedYear} by
              copying expenses from the previous month. Do you want to continue?
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