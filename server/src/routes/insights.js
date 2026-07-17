import { Router } from "express";
import { prisma } from "../prismaClient.js";

export const insightsRouter = Router();

// Rule-based insight generation — no external AI API, so this stays free
// and works offline. Every insight is derived straight from the user's
// own transactions/subscriptions/goals; nothing here is fabricated.
insightsRouter.get("/", async (req, res) => {
  const userId = req.userId;
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonthTx, lastMonthTx, categories, subscriptions, goals] = await Promise.all([
    prisma.transaction.findMany({ where: { userId, date: { gte: thisMonthStart } } }),
    prisma.transaction.findMany({ where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    prisma.category.findMany({ where: { userId } }),
    prisma.subscription.findMany({ where: { userId, active: true } }),
    prisma.savingsGoal.findMany({ where: { userId } }),
  ]);

  const byId = Object.fromEntries(categories.map((c) => [c.id, c]));
  const sumBy = (rows, pred) => rows.filter(pred).reduce((s, t) => s + t.amount, 0);
  const groupExpenseByCategory = (rows) => {
    const map = {};
    for (const t of rows) {
      if (t.type !== "expense") continue;
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    }
    return map;
  };

  const thisByCat = groupExpenseByCategory(thisMonthTx);
  const lastByCat = groupExpenseByCategory(lastMonthTx);
  const insights = [];

  // 1. Category deltas — flag the largest % increase over $30 in absolute terms
  let biggestJump = null;
  for (const [catId, amount] of Object.entries(thisByCat)) {
    const prev = lastByCat[catId] || 0;
    const delta = amount - prev;
    if (prev > 0 && delta > 30) {
      const pct = Math.round((delta / prev) * 100);
      if (!biggestJump || pct > biggestJump.pct) {
        biggestJump = { pct, delta, amount, name: byId[catId]?.name ?? "Uncategorized" };
      }
    } else if (prev === 0 && amount > 30 && (!biggestJump || amount > biggestJump.amount)) {
      biggestJump = { pct: null, delta: amount, amount, name: byId[catId]?.name ?? "Uncategorized", isNew: true };
    }
  }
  if (biggestJump) {
    insights.push({
      id: "category-jump",
      severity: "notice",
      title: biggestJump.isNew
        ? `New spending in ${biggestJump.name}`
        : `${biggestJump.name} is up ${biggestJump.pct}% this month`,
      body: biggestJump.isNew
        ? `You've spent $${biggestJump.amount.toFixed(2)} in ${biggestJump.name} this month with nothing in the same category last month.`
        : `You've spent $${biggestJump.amount.toFixed(2)} in ${biggestJump.name} so far — $${biggestJump.delta.toFixed(2)} more than last month's $${(biggestJump.amount - biggestJump.delta).toFixed(2)}.`,
    });
  }

  // 2. Category drops — reward good behavior too, not just warnings
  let biggestDrop = null;
  for (const [catId, prevAmount] of Object.entries(lastByCat)) {
    const amount = thisByCat[catId] || 0;
    const delta = prevAmount - amount;
    if (prevAmount > 30 && delta > 20) {
      const pct = Math.round((delta / prevAmount) * 100);
      if (!biggestDrop || pct > biggestDrop.pct) {
        biggestDrop = { pct, delta, name: byId[catId]?.name ?? "Uncategorized" };
      }
    }
  }
  if (biggestDrop) {
    insights.push({
      id: "category-drop",
      severity: "positive",
      title: `${biggestDrop.name} is down ${biggestDrop.pct}% from last month`,
      body: `Nice — you've saved about $${biggestDrop.delta.toFixed(2)} in ${biggestDrop.name} compared to last month's pace.`,
    });
  }

  // 3. Savings rate this month
  const income = sumBy(thisMonthTx, (t) => t.type === "income");
  const expense = sumBy(thisMonthTx, (t) => t.type === "expense");
  if (income > 0) {
    const rate = Math.round(((income - expense) / income) * 100);
    insights.push({
      id: "savings-rate",
      severity: rate >= 15 ? "positive" : rate >= 0 ? "notice" : "warning",
      title: rate >= 0 ? `You're saving ${rate}% of income this month` : `Spending has outpaced income by $${(expense - income).toFixed(2)} this month`,
      body: rate >= 0
        ? `$${income.toFixed(2)} in, $${expense.toFixed(2)} out so far this month.`
        : `You've earned $${income.toFixed(2)} but spent $${expense.toFixed(2)} so far this month.`,
    });
  }

  // 4. Subscription load
  if (subscriptions.length > 0) {
    const monthlyTotal = subscriptions.reduce(
      (s, sub) => s + (sub.billingCycle === "yearly" ? sub.amount / 12 : sub.amount),
      0
    );
    insights.push({
      id: "subscription-load",
      severity: subscriptions.length >= 5 ? "notice" : "info",
      title: `${subscriptions.length} active subscription${subscriptions.length === 1 ? "" : "s"} costing $${monthlyTotal.toFixed(2)}/mo`,
      body:
        subscriptions.length >= 5
          ? `That's ${((monthlyTotal * 12) / 12).toFixed(2)} × 12 = $${(monthlyTotal * 12).toFixed(2)}/yr across ${subscriptions.length} services — worth a quick review for overlap.`
          : `Roughly $${(monthlyTotal * 12).toFixed(2)}/yr across your active subscriptions.`,
    });
  }

  // 5. Goal pacing
  const nearGoal = goals.find((g) => g.targetAmount > 0 && g.currentAmount / g.targetAmount >= 0.9 && g.currentAmount < g.targetAmount);
  if (nearGoal) {
    const remaining = nearGoal.targetAmount - nearGoal.currentAmount;
    insights.push({
      id: "goal-near",
      severity: "positive",
      title: `${nearGoal.name} is ${Math.round((nearGoal.currentAmount / nearGoal.targetAmount) * 100)}% funded`,
      body: `Just $${remaining.toFixed(2)} left to reach your $${nearGoal.targetAmount.toFixed(2)} goal.`,
    });
  }

  // 6. Largest single transaction this month
  const biggestTx = [...thisMonthTx].filter((t) => t.type === "expense").sort((a, b) => b.amount - a.amount)[0];
  if (biggestTx) {
    insights.push({
      id: "biggest-transaction",
      severity: "info",
      title: `Largest expense this month: $${biggestTx.amount.toFixed(2)}`,
      body: `${biggestTx.description || byId[biggestTx.categoryId]?.name || "A transaction"} on ${biggestTx.date.toISOString().slice(0, 10)}.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "empty",
      severity: "info",
      title: "Add a few transactions to unlock insights",
      body: "Once you've logged some income and expenses this month, patterns and trends will show up here automatically.",
    });
  }

  res.json(insights);
});
