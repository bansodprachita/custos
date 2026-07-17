import { Router } from "express";
import { prisma } from "../prismaClient.js";

export const notificationsRouter = Router();

// Notifications are derived on read, not stored — there's no background
// job (this stays free/simple to run), so "unread" is approximated by
// the client persisting which notification ids it has already seen.
notificationsRouter.get("/", async (req, res) => {
  const userId = req.userId;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [budgets, subscriptions, goals] = await Promise.all([
    prisma.budget.findMany({ where: { userId }, include: { category: true } }),
    prisma.subscription.findMany({ where: { userId, active: true, nextRenewal: { gte: now, lte: weekAhead } } }),
    prisma.savingsGoal.findMany({ where: { userId } }),
  ]);

  const notifications = [];

  for (const b of budgets) {
    const spentResult = await prisma.transaction.aggregate({
      where: { categoryId: b.categoryId, userId, type: "expense", date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    });
    const spent = spentResult._sum.amount ?? 0;
    const percent = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    if (percent >= 100) {
      notifications.push({
        id: `budget-over-${b.id}`,
        type: "budget",
        severity: "warning",
        message: `${b.category.name} budget exceeded — $${spent.toFixed(2)} of $${b.amount.toFixed(2)}`,
        createdAt: now.toISOString(),
      });
    } else if (percent >= 85) {
      notifications.push({
        id: `budget-warn-${b.id}`,
        type: "budget",
        severity: "notice",
        message: `${b.category.name} is at ${Math.round(percent)}% of its $${b.amount.toFixed(2)} budget`,
        createdAt: now.toISOString(),
      });
    }
  }

  for (const sub of subscriptions) {
    const days = Math.ceil((sub.nextRenewal.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    notifications.push({
      id: `renewal-${sub.id}`,
      type: "subscription",
      severity: "info",
      message: `${sub.name} renews in ${days} day${days === 1 ? "" : "s"} — $${sub.amount.toFixed(2)}`,
      createdAt: now.toISOString(),
    });
  }

  for (const g of goals) {
    if (g.targetAmount > 0 && g.currentAmount >= g.targetAmount) {
      notifications.push({
        id: `goal-complete-${g.id}`,
        type: "goal",
        severity: "positive",
        message: `${g.name} goal reached! $${g.currentAmount.toFixed(2)} saved.`,
        createdAt: now.toISOString(),
      });
    }
  }

  res.json(notifications);
});
