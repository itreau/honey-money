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

    "/api/expenses": {
      async GET(req) {
        const url = new URL(req.url);
        const monthId = parseInt(url.searchParams.get("monthId") || "0");
        const expenses = await repo.getExpensesByMonthId(monthId);
        return Response.json(expenses);
      },
    },

    "/api/expenses/:id": {
      async PATCH(req) {
        const id = parseInt(req.params.id);
        const body = await req.json();
        await repo.updateExpense(id, body.amount);
        return Response.json({ success: true });
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
