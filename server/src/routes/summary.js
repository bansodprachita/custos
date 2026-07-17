import { Router } from "express";
import { prisma } from "../prismaClient.js";

export const summaryRouter = Router();

summaryRouter.get("/by-category", async (req, res) => {
  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { type: "expense", userId: req.userId },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({ where: { userId: req.userId } });
  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));

  const result = grouped
    .map((g) => ({
      categoryId: g.categoryId,
      name: byId[g.categoryId]?.name ?? "Unknown",
      color: byId[g.categoryId]?.color ?? "#7A7A72",
      total: g._sum.amount ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  res.json(result);
});

summaryRouter.get("/by-month", async (req, res) => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId },
    select: { amount: true, type: true, date: true },
  });

  const byMonth = {};
  for (const t of transactions) {
    const key = t.date.toISOString().slice(0, 7);
    byMonth[key] ??= { month: key, income: 0, expense: 0 };
    byMonth[key][t.type] += t.amount;
  }

  const result = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));
  res.json(result);
});
