import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { validateBody, savingsGoalSchema, contributionSchema } from "../middleware/validate.js";

export const goalsRouter = Router();

goalsRouter.get("/", async (req, res) => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "asc" },
  });
  res.json(goals);
});

goalsRouter.post("/", validateBody(savingsGoalSchema), async (req, res) => {
  const goal = await prisma.savingsGoal.create({
    data: { ...req.validated, userId: req.userId },
  });
  res.status(201).json(goal);
});

goalsRouter.put("/:id", validateBody(savingsGoalSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Goal not found" });

  const goal = await prisma.savingsGoal.update({ where: { id }, data: req.validated });
  res.json(goal);
});

// Add a contribution to a goal's current amount — the common action on
// this page, so it gets its own lightweight endpoint rather than forcing
// the client to read-modify-write the full goal through PUT.
goalsRouter.post("/:id/contribute", validateBody(contributionSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Goal not found" });

  const goal = await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: existing.currentAmount + req.validated.amount },
  });
  res.json(goal);
});

goalsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.savingsGoal.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Goal not found" });

  await prisma.savingsGoal.delete({ where: { id } });
  res.status(204).send();
});
