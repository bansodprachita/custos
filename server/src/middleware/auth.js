import jwt from "jsonwebtoken";

// In production, set a real JWT_SECRET in .env — this fallback only exists
// so the app doesn't crash on first run before you've configured one.
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

// Reads the "Authorization: Bearer <token>" header, verifies it, and
// attaches req.userId. Every data route (transactions, categories,
// summary, budgets) sits behind this — auth routes themselves do not.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Session expired or invalid. Please log in again." });
  }
}
