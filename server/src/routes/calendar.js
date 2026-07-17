import { Router } from "express";
import { prisma } from "../prismaClient.js";

export const calendarRouter = Router();

// GET /calendar?month=YYYY-MM — per-day spend totals plus subscription
// renewals landing in that month, so the client can render a heat-dot
// calendar without pulling every transaction down itself.
calendarRouter.get("/", async (req, res) => {
  const monthParam = req.query.month; // "2026-07"
  const now = new Date();
  const [year, month] = monthParam && /^\d{4}-\d{2}$/.test(monthParam)
    ? monthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const [transactions, subscriptions] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: req.userId, date: { gte: start, lte: end } },
      include: { category: true },
    }),
    prisma.subscription.findMany({
      where: { userId: req.userId, active: true, nextRenewal: { gte: start, lte: end } },
    }),
  ]);

  const days = {};
  for (const t of transactions) {
    const key = t.date.toISOString().slice(0, 10);
    days[key] ??= { date: key, income: 0, expense: 0, count: 0, categories: new Set() };
    days[key][t.type] += t.amount;
    days[key].count += 1;
    days[key].categories.add(t.category?.name ?? "Uncategorized");
  }
  for (const sub of subscriptions) {
    const key = sub.nextRenewal.toISOString().slice(0, 10);
    days[key] ??= { date: key, income: 0, expense: 0, count: 0, categories: new Set() };
    days[key].bills ??= [];
    days[key].bills.push({ name: sub.name, amount: sub.amount });
  }

  const result = Object.values(days)
    .map((d) => ({ ...d, categories: Array.from(d.categories) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({ month: `${year}-${String(month).padStart(2, "0")}`, days: result });
});
