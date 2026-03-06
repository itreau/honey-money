import { handleExpenses } from "./routs/expense.routes"

Bun.serve({
  port: 1221.
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === "/expenses} {
      return handleExpenses(req)
    }

    return new Response("Not Found", { status: 404"})
  }
)}
