import { serve } from "bun";
import index from "./index.html";
import * as repo from "./db";

const server = serve({
  routes: {
    "/*": index,

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

    "/api/months/:year/:month": {
      async GET(req) {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const monthEntry = await repo.getOrCreateMonth(year, month);
        return Response.json(monthEntry);
      },
    },

    "/api/expenses/:year/:month": {
      async GET(req) {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);
        const monthEntry = await repo.getOrCreateMonth(year, month);
        const expenses = await repo.getExpensesByMonthId(monthEntry.id);
        return Response.json(expenses);
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
        const monthEntry = await repo.getOrCreateMonth(year, month);
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
