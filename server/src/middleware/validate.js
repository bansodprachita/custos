import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  type: z.enum(["income", "expense"]),
  description: z.string().max(280).optional(),
  date: z.coerce.date(),
  categoryId: z.number().int().positive(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(40),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex code")
    .optional(),
});

export const budgetSchema = z.object({
  categoryId: z.number().int().positive(),
  amount: z.number().positive("Budget must be greater than zero"),
});

export const authSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const accountSchema = z.object({
  name: z.string().min(1).max(40),
  type: z.enum(["checking", "savings", "credit"]),
  last4: z
    .string()
    .regex(/^\d{4}$/, "Last 4 must be 4 digits")
    .optional()
    .or(z.literal("")),
  startingBalance: z.number().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex code")
    .optional(),
});

export const subscriptionSchema = z.object({
  name: z.string().min(1).max(60),
  amount: z.number().positive("Amount must be greater than zero"),
  billingCycle: z.enum(["monthly", "yearly"]),
  nextRenewal: z.coerce.date(),
  active: z.boolean().optional(),
  categoryId: z.number().int().positive().optional().nullable(),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1).max(60),
  targetAmount: z.number().positive("Target must be greater than zero"),
  currentAmount: z.number().min(0).optional(),
  targetDate: z.coerce.date().optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex code")
    .optional(),
});

export const contributionSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

// Wraps a Zod schema into an Express middleware that validates req.body
// and returns a 400 with readable field errors instead of throwing.
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }
    req.validated = result.data;
    next();
  };
}
