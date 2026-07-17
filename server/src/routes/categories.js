import { Router } from "express";
import { prisma } from "../prismaClient.js";
import { validateBody, categorySchema } from "../middleware/validate.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

categoriesRouter.post("/", validateBody(categorySchema), async (req, res) => {
  try {
    const category = await prisma.category.create({
      data: { ...req.validated, userId: req.userId },
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: "Category name must be unique" });
  }
});

categoriesRouter.put("/:id", validateBody(categorySchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Category not found" });

  try {
    const category = await prisma.category.update({
      where: { id },
      data: req.validated,
    });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: "Category name must be unique" });
  }
});

categoriesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Category not found" });

  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    // Fails if transactions still reference this category (FK constraint)
    res.status(409).json({ error: "Reassign or delete this category's transactions first" });
  }
});
