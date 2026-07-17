import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prismaClient.js";
import { signToken } from "../middleware/auth.js";
import { validateBody, authSchema } from "../middleware/validate.js";
import { getFirebaseAuth } from "../firebaseAdmin.js";

export const authRouter = Router();

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#B5502A" },
  { name: "Rent", color: "#5C2810" },
  { name: "Transport", color: "#5F7A45" },
  { name: "Entertainment", color: "#A8790F" },
  { name: "Utilities", color: "#33421C" },
  { name: "Income", color: "#5F7A45" },
  { name: "Other", color: "#8A7862" },
];

// Give every new account a starting set of categories so the dashboard
// isn't a completely blank slate on first login.
async function seedDefaultCategories(userId) {
  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
  });
}

authRouter.post("/register", validateBody(authSchema), async (req, res) => {
  const { email, password } = req.validated;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  await seedDefaultCategories(user.id);

  res.status(201).json({ token: signToken(user.id), email: user.email, name: user.name });
});

authRouter.post("/login", validateBody(authSchema), async (req, res) => {
  const { email, password } = req.validated;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ token: signToken(user.id), email: user.email, name: user.name });
});

authRouter.post("/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "Missing Google ID token" });
  }

  let decoded;
  try {
    decoded = await getFirebaseAuth().verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ error: "Could not verify Google sign-in" });
  }

  const { email, name, uid } = decoded;
  if (!email) {
    return res.status(400).json({ error: "Your Google account has no email to sign in with" });
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.googleId) {
    // A password account already exists for this email — same person,
    // same verified email, so link the two rather than creating a duplicate.
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: uid, name: user.name || name },
    });
  }

  if (!user) {
    user = await prisma.user.create({ data: { email, name, googleId: uid } });
    await seedDefaultCategories(user.id);
  }

  res.json({ token: signToken(user.id), email: user.email, name: user.name });
});
