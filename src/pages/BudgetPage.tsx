import { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyInput } from "@/components/CurrencyInput";
import { Label } from "@/components/ui/label";
import { Loader, Check, AlertCircle, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BudgetTable from "@/components/BudgetTable";
import { ExpensesPieChart } from "@/components/ExpensesPieChart";
import type { Expense } from "@/models/Expense";
import type { Month } from "@/models/Month";

type Status = "idle" | "saving" | "loading" | "saved" | "error";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function formatMonth(month: number): string {
  const date = new Date(2000, month - 1);
  return date.toLocaleDateString("en-US", { month: "long" });
}

export default function BudgetPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<Month | null>(null);
  const [sheets, setSheets] = useState<Month[]>([]);
  const [monthExists, setMonthExists] = useState<boolean | null>(null);
  const [currentPay, setCurrentPay] = useState<number>(0);
  const [pendingPay, setPendingPay] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showNewSheetDialog, setShowNewSheetDialog] = useState(false);
  const [showDeleteSheetDialog, setShowDeleteSheetDialog] = useState(false);
  const [newSheetName, setNewSheetName] = useState("");
  const [copyFromSheetId, setCopyFromSheetId] = useState<number | null>(null);
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
      fetchSheets();
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (selectedSheet) {
      fetchExpenses();
    }
  }, [selectedSheet]);

  const handleYearChange = useCallback((direction: "prev" | "next") => {
    if (selectedYear === null) return;
    const newYear = direction === "next" ? selectedYear + 1 : selectedYear - 1;
    const currentMonth = new Date().getMonth() + 1;
    setSelectedYear(newYear);
    setSelectedMonth(currentMonth);
    setSelectedSheet(null);
    setSheets([]);
    setMonthExists(null);
  }, [selectedYear]);

  const handleYearSelect = useCallback((year: string) => {
    const newYear = parseInt(year);
    if (newYear !== selectedYear) {
      const currentMonth = new Date().getMonth() + 1;
      setSelectedYear(newYear);
      setSelectedMonth(currentMonth);
      setSelectedSheet(null);
      setSheets([]);
      setMonthExists(null);
    }
  }, [selectedYear]);

  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(parseInt(month));
    setSelectedSheet(null);
  }, []);

  async function fetchSheets() {
    if (selectedYear === null || selectedMonth === null) return;
    try {
      const res = await fetch(`/api/sheets/${selectedYear}/${selectedMonth}`);
      const data = await res.json();
      setSheets(data);
      if (data.length > 0) {
        const mainSheet = data.find((s: Month) => s.name === "Main") || data[0];
        setSelectedSheet(mainSheet);
        setMonthExists(true);
      } else {
        setSelectedSheet(null);
        setMonthExists(false);
      }
    } catch {
      setSheets([]);
      setSelectedSheet(null);
      setMonthExists(false);
    }
  }

  async function fetchExpenses() {
    if (!selectedSheet) return;
    setExpensesLoading(true);
    try {
      const res = await fetch(`/api/expenses/${selectedYear}/${selectedMonth}?sheetId=${selectedSheet.id}`);
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
    setSelectedSheet(month);
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
        `/api/sheets/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Main" }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create sheet");
      }

      const data = await res.json();
      if (!data.month) {
        throw new Error("Invalid response");
      }

      setExpenses(data.expenses || []);
      setMonthExists(true);
      setSheets([data.month]);
      setSelectedSheet(data.month);
    } catch (error) {
      console.error("Error creating sheet:", error);
      alert("Failed to create sheet. Please try again.");
    } finally {
      setIsCreating(false);
      setShowCreateDialog(false);
    }
  }

  async function handleCreateNewSheet() {
    if (selectedYear === null || selectedMonth === null || !newSheetName.trim()) return;

    try {
      setIsCreating(true);
      const res = await fetch(
        `/api/sheets/${selectedYear}/${selectedMonth}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newSheetName.trim(),
            copyFromMonthId: copyFromSheetId,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create sheet");
      }

      const data = await res.json();
      if (!data.month) {
        throw new Error("Invalid response");
      }

      setSheets((prev) => [...prev, data.month]);
      setSelectedSheet(data.month);
      setNewSheetName("");
      setCopyFromSheetId(null);
    } catch (error) {
      console.error("Error creating sheet:", error);
      alert("Failed to create sheet. Please try again.");
    } finally {
      setIsCreating(false);
      setShowNewSheetDialog(false);
    }
  }

  async function handleDeleteSheet() {
    if (!selectedSheet) return;

    try {
      await fetch(`/api/sheets/${selectedSheet.id}`, { method: "DELETE" });
      setSheets((prev) => prev.filter((s) => s.id !== selectedSheet.id));
      const remainingSheets = sheets.filter((s) => s.id !== selectedSheet.id);
      if (remainingSheets.length > 0) {
        setSelectedSheet(remainingSheets[0]);
      } else {
        setSelectedSheet(null);
        setMonthExists(false);
      }
      setExpenses([]);
    } finally {
      setShowDeleteSheetDialog(false);
    }
  }

  const displayedYears = useMemo(() => {
    if (selectedYear === null) return [];
    const currentYear = new Date().getFullYear();
    const years = new Set([selectedYear - 1, selectedYear, selectedYear + 1, currentYear]);
    return Array.from(years).sort((a, b) => a - b);
  }, [selectedYear]);

  const showCreateButton = monthExists === false && !expensesLoading;

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

          <div className="flex items-end gap-4">
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
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {formatMonth(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sheets.length > 0 && (
              <>
                <div className="w-48 space-y-2">
                  <Label htmlFor="sheet-select">Sheet</Label>
                  <Select
                    value={selectedSheet?.id?.toString() || ""}
                    onValueChange={(id) => {
                      const sheet = sheets.find((s) => s.id === parseInt(id));
                      setSelectedSheet(sheet || null);
                    }}
                  >
                    <SelectTrigger id="sheet-select">
                      <SelectValue placeholder="Select sheet" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheets.map((sheet) => (
                        <SelectItem key={sheet.id} value={sheet.id.toString()}>
                          {sheet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewSheetDialog(true)}
                  className="mb-0.5"
                  title="Add new sheet"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowDeleteSheetDialog(true)}
                  disabled={sheets.length <= 1}
                  className="mb-0.5"
                  title="Delete sheet"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>
              {selectedSheet?.name || "Monthly Budget"}
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
                  Create Expense Sheet
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

        {selectedSheet && <ExpensesPieChart expenses={expenses} />}

        {selectedSheet && (
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
        )}
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
              {selectedMonth && formatMonth(selectedMonth)} {selectedYear}.
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

      <Dialog open={showNewSheetDialog} onOpenChange={setShowNewSheetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sheet</DialogTitle>
            <DialogDescription>
              Create a new budget sheet for {selectedMonth && formatMonth(selectedMonth)}{" "}
              {selectedYear}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheet-name">Sheet Name</Label>
              <Input
                id="sheet-name"
                placeholder="e.g., Vacation Fund"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copy-from">Copy from existing sheet (optional)</Label>
              <Select
                value={copyFromSheetId?.toString() || "none"}
                onValueChange={(val) =>
                  setCopyFromSheetId(val === "none" ? null : parseInt(val))
                }
              >
                <SelectTrigger id="copy-from">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (start empty)</SelectItem>
                  {sheets.map((sheet) => (
                    <SelectItem key={sheet.id} value={sheet.id.toString()}>
                      {sheet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewSheetDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewSheet}
              disabled={!newSheetName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteSheetDialog} onOpenChange={setShowDeleteSheetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sheet?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedSheet?.name}"? This will
              permanently delete all expenses in this sheet. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleDeleteSheet} variant="destructive">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}