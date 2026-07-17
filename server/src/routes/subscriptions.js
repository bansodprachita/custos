import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { validateBody, subscriptionSchema } from "../middleware/validate.js";

export const subscriptionsRouter = Router();

subscriptionsRouter.get("/", async (req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: req.userId },
    include: { category: true },
    orderBy: { nextRenewal: "asc" },
  });
  res.json(subscriptions);
});

subscriptionsRouter.post("/", validateBody(subscriptionSchema), async (req, res) => {
  const subscription = await prisma.subscription.create({
    data: { ...req.validated, userId: req.userId },
    include: { category: true },
  });
  res.status(201).json(subscription);
});

subscriptionsRouter.put("/:id", validateBody(subscriptionSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.subscription.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Subscription not found" });

  const subscription = await prisma.subscription.update({
    where: { id },
    data: req.validated,
    include: { category: true },
  });
  res.json(subscription);
});

subscriptionsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.subscription.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Subscription not found" });

  await prisma.subscription.delete({ where: { id } });
  res.status(204).send();
});
