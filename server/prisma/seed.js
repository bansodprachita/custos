import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Food", color: "#FF7A45" },
  { name: "Rent", color: "#8B7CF6" },
  { name: "Transport", color: "#6FC7A7" },
  { name: "Entertainment", color: "#F2C14E" },
  { name: "Utilities", color: "#6FA8DC" },
  { name: "Income", color: "#4CAF82" },
  { name: "Other", color: "#B7AFA3" },
];

async function main() {
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
