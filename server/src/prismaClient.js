import { PrismaClient } from "@prisma/client";

// A single shared instance avoids exhausting DB connections in dev
// (each hot-reload would otherwise spin up a new one).
export const prisma = new PrismaClient();
