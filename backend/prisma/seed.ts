/// <reference types="node" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Café da Manhã" },
    { name: "Almoço" },
    { name: "Jantar" },
    { name: "Sobremesa" },
    { name: "Lanche" },
    { name: "Bebida" },
    { name: "Entrada" },
    { name: "Salada" },
    { name: "Sopa" },
    { name: "Pães e Confeitaria" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: categories.indexOf(category) + 1 },
      update: {},
      create: category,
    });
  }

  console.log("Categories seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
