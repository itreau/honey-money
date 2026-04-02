import { serve } from "bun";
import index from "./index.html";
import * as repo from "./db";

const server = serve({
  routes: {
    "/*": index,

    "/api/years": {
      async GET() {
        const years = await repo.getAvailableYears();
        return Response.json(years);
      },
    },

    "/api/months": {
      async GET() {
        const months = await repo.getAllMonths();
        return Response.json(months);
      },
    },

    "/api/months/current": {
      async POST() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const currentMonth = await repo.getOrCreateMonth(year, month);
        return Response.json(currentMonth);
      },
    },

    "/api/sheets/:year/:month": {
      async GET(req) {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const sheets = await repo.getSheetsByYearMonth(year, month);
        return Response.json(sheets);
      },
      async POST(req) {
        try {
          const year = parseInt(req.params.year);
          const month = parseInt(req.params.month);
          const body = await req.json();
          const name = body?.name || "Main";
          const copyFromMonthId = body?.copyFromMonthId ? parseInt(body.copyFromMonthId) : null;

          let sheet;
          if (copyFromMonthId) {
            sheet = await repo.createSheetFromPrevious(year, month, name, copyFromMonthId);
          } else {
            sheet = await repo.createSheet(year, month, name);
          }

          const expenses = await repo.getExpensesByMonthId(sheet.id);
          return Response.json({ month: sheet, expenses });
        } catch (error) {
          console.error("Error creating sheet:", error);
          return Response.json({ error: "Failed to create sheet" }, { status: 500 });
        }
      },
    },

    "/api/sheets/:id": {
      async DELETE(req) {
        const id = parseInt(req.params.id);
        await repo.deleteSheet(id);
        return Response.json({ success: true });
      },
    },

    "/api/expenses/:year/:month": {
      async GET(req) {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const url = new URL(req.url);
        const sheetId = url.searchParams.get("sheetId");

        let monthEntry;
        if (sheetId) {
          monthEntry = await repo.getMonthById(parseInt(sheetId));
        } else {
          monthEntry = await repo.getMonthByYearMonth(year, month);
        }

        if (!monthEntry) {
          return Response.json({ expenses: [], monthExists: false, sheet: null });
        }

        const expenses = await repo.getExpensesByMonthId(monthEntry.id);
        return Response.json({ expenses, monthExists: true, sheet: monthEntry });
      },
    },

    "/api/expenses/:id": {
      async PATCH(req) {
        const id = parseInt(req.params.id);
        const body = await req.json();
        await repo.updateExpense(id, body);
        return Response.json({ success: true });
      },
      async DELETE(req) {
        const id = parseInt(req.params.id);
        await repo.deleteExpense(id);
        return Response.json({ success: true });
      },
    },

    "/api/expenses/add/:year/:month": {
      async POST(req) {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const url = new URL(req.url);
        const sheetId = url.searchParams.get("sheetId");

        let monthEntry;
        if (sheetId) {
          monthEntry = await repo.getMonthById(parseInt(sheetId));
        } else {
          monthEntry = await repo.getOrCreateMonth(year, month);
        }

        if (!monthEntry) {
          return Response.json({ error: "Sheet not found" }, { status: 404 });
        }

        const prevExpenses = await repo.getPreviousMonthExpenses(year, month);

        if (prevExpenses.length > 0) {
          const lastExpense = prevExpenses[prevExpenses.length - 1];
          const expense = await repo.addExpense(monthEntry.id, {
            category: lastExpense.category,
            budget: lastExpense.budget,
          });
          return Response.json(expense);
        }

        const expense = await repo.addExpense(monthEntry.id);
        return Response.json(expense);
      },
    },

    "/api/pay/latest": {
      async GET() {
        const pay = await repo.getLatestPay();
        return Response.json(pay);
      },
    },

    "/api/pay": {
      async POST(req) {
        const body = await req.json();
        const pay = await repo.createPay(body.amount);
        return Response.json(pay);
      },
    },

    "/api/templates": {
      async GET() {
        const templates = await repo.getTemplates();
        return Response.json(templates);
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);