import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetTable from "@/components/BudgetTable";
import AddExpenseDialog from "@/components/AddExpenseDialog";

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Budget Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget</CardTitle>
          </CardHeader>

          <CardContent>
            <BudgetTable />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
