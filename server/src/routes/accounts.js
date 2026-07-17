import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { validateBody, accountSchema } from "../middleware/validate.js";

export const accountsRouter = Router();

// Balance is starting balance + income - expense for every transaction
// tagged to this account, computed on read rather than stored, so it can
// never drift out of sync with the ledger.
async function withBalance(account) {
  const agg = await prisma.transaction.groupBy({
    by: ["type"],
    where: { accountId: account.id },
    _sum: { amount: true },
  });
  const income = agg.find((a) => a.type === "income")?._sum.amount ?? 0;
  const expense = agg.find((a) => a.type === "expense")?._sum.amount ?? 0;
  return { ...account, balance: account.startingBalance + income - expense };
}

accountsRouter.get("/", async (req, res) => {
  const accounts = await prisma.account.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(await Promise.all(accounts.map(withBalance)));
});

accountsRouter.get("/:id/transactions", async (req, res) => {
  const id = Number(req.params.id);
  const account = await prisma.account.findFirst({ where: { id, userId: req.userId } });
  if (!account) return res.status(404).json({ error: "Account not found" });

  const transactions = await prisma.transaction.findMany({
    where: { accountId: id, userId: req.userId },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 20,
  });
  res.json(transactions);
});

accountsRouter.post("/", validateBody(accountSchema), async (req, res) => {
  const account = await prisma.account.create({
    data: { ...req.validated, last4: req.validated.last4 || null, userId: req.userId },
  });
  res.status(201).json(await withBalance(account));
});

accountsRouter.put("/:id", validateBody(accountSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.account.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Account not found" });

  const account = await prisma.account.update({
    where: { id },
    data: { ...req.validated, last4: req.validated.last4 || null },
  });
  res.json(await withBalance(account));
});

accountsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.account.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Account not found" });

  // Unlink rather than cascade-delete transactions — the money still moved.
  await prisma.transaction.updateMany({ where: { accountId: id }, data: { accountId: null } });
  await prisma.account.delete({ where: { id } });
  res.status(204).send();
});
