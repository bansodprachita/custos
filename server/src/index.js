import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";
import { transactionsRouter } from "./routes/transactions.js";
import { categoriesRouter } from "./routes/categories.js";
import { summaryRouter } from "./routes/summary.js";
import { budgetsRouter } from "./routes/budgets.js";
import { profileRouter } from "./routes/profile.js";
import { accountsRouter } from "./routes/accounts.js";
import { subscriptionsRouter } from "./routes/subscriptions.js";
import { goalsRouter } from "./routes/goals.js";
import { insightsRouter } from "./routes/insights.js";
import { calendarRouter } from "./routes/calendar.js";
import { notificationsRouter } from "./routes/notifications.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", app: "custos" }));

// Public — no token required
app.use("/auth", authRouter);

// Everything below requires a valid Bearer token; requireAuth attaches
// req.userId, which every route below uses to scope its queries.
app.use("/transactions", requireAuth, transactionsRouter);
app.use("/categories", requireAuth, categoriesRouter);
app.use("/summary", requireAuth, summaryRouter);
app.use("/budgets", requireAuth, budgetsRouter);
app.use("/profile", requireAuth, profileRouter);
app.use("/accounts", requireAuth, accountsRouter);
app.use("/subscriptions", requireAuth, subscriptionsRouter);
app.use("/goals", requireAuth, goalsRouter);
app.use("/insights", requireAuth, insightsRouter);
app.use("/calendar", requireAuth, calendarRouter);
app.use("/notifications", requireAuth, notificationsRouter);

// Last-resort error handler so a thrown error never crashes the process silently
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Custos API listening on http://localhost:${PORT}`);
});
