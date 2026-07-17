import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { validateBody, transactionSchema } from "../middleware/validate.js";

export const transactionsRouter = Router();

// Shared by the list endpoint and the CSV export, always scoped to the
// logged-in user so nobody can filter their way into someone else's data.
function buildWhere(userId, { from, to, categoryId, type, search }) {
  const where = { userId };
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }
  if (categoryId) where.categoryId = Number(categoryId);
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { description: { contains: search } },
      { category: { name: { contains: search } } },
    ];
  }
  return where;
}

async function assertOwnsCategory(userId, categoryId) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  return Boolean(category);
}

transactionsRouter.get("/", async (req, res) => {
  const { page, pageSize } = req.query;
  const where = buildWhere(req.userId, req.query);

  if (page) {
    const pageNum = Math.max(1, Number(page));
    const size = Math.max(1, Number(pageSize) || 10);
    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: (pageNum - 1) * size,
        take: size,
      }),
      prisma.transaction.count({ where }),
    ]);
    return res.json({
      data,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.max(1, Math.ceil(total / size)),
    });
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });
  res.json(transactions);
});

transactionsRouter.get("/export", async (req, res) => {
  const where = buildWhere(req.userId, req.query);
  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  const escape = (value) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const header = ["Date", "Type", "Category", "Amount", "Description"];
  const rows = transactions.map((t) => [
    t.date.toISOString().slice(0, 10),
    t.type,
    t.category?.name ?? "",
    t.amount,
    t.description ?? "",
  ]);
  const csv = [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="custos-transactions.csv"');
  res.send(csv);
});

transactionsRouter.post("/", validateBody(transactionSchema), async (req, res) => {
  if (!(await assertOwnsCategory(req.userId, req.validated.categoryId))) {
    return res.status(400).json({ error: "Invalid category" });
  }
  try {
    const transaction = await prisma.transaction.create({
      data: { ...req.validated, userId: req.userId },
      include: { category: true },
    });
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: "Could not create transaction", detail: err.message });
  }
});

transactionsRouter.put("/:id", validateBody(transactionSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Transaction not found" });

  if (!(await assertOwnsCategory(req.userId, req.validated.categoryId))) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: req.validated,
    include: { category: true },
  });
  res.json(transaction);
});

transactionsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Transaction not found" });

  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
});
