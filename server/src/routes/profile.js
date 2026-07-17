import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../prismaClient.js";
import { validateBody } from "../middleware/validate.js";

export const profileRouter = Router();

const profileSchema = z.object({
  name: z.string().max(60).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

profileRouter.get("/", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

profileRouter.put("/", validateBody(profileSchema), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name: req.validated.name },
    select: { id: true, email: true, name: true },
  });
  res.json(user);
});

profileRouter.put("/password", validateBody(passwordSchema), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  const valid = await bcrypt.compare(req.validated.currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(req.validated.newPassword, 10);
  await prisma.user.update({ where: { id: req.userId }, data: { passwordHash } });
  res.json({ success: true });
});
