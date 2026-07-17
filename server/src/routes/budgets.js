import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { validateBody, budgetSchema } from "../middleware/validate.js";

export const budgetsRouter = Router();

budgetsRouter.get("/", async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId },
    include: { category: true },
  });
  res.json(budgets);
});

budgetsRouter.get("/status", async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId },
    include: { category: true },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const status = await Promise.all(
    budgets.map(async (b) => {
      const spentResult = await prisma.transaction.aggregate({
        where: {
          categoryId: b.categoryId,
          userId: req.userId,
          type: "expense",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });
      const spent = spentResult._sum.amount ?? 0;
      return {
        categoryId: b.categoryId,
        name: b.category.name,
        color: b.category.color,
        budgetAmount: b.amount,
        spent,
        percent: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
      };
    })
  );

  res.json(status.sort((a, c) => c.percent - a.percent));
});

budgetsRouter.post("/", validateBody(budgetSchema), async (req, res) => {
  const category = await prisma.category.findFirst({
    where: { id: req.validated.categoryId, userId: req.userId },
  });
  if (!category) return res.status(400).json({ error: "Invalid category" });

  try {
    const budget = await prisma.budget.upsert({
      where: { categoryId: req.validated.categoryId },
      update: { amount: req.validated.amount },
      create: { ...req.validated, userId: req.userId },
      include: { category: true },
    });
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: "Could not save budget", detail: err.message });
  }
});

budgetsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.budget.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Budget not found" });

  await prisma.budget.delete({ where: { id } });
  res.status(204).send();
});
