const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    'Entradas',
    'Saladas',
    'Acompanhamentos',
    'Pratos Principais',
    'Lanches',
    'Sobremesas',
    'Sopas',
    'Bebidas',

    'Carne - Bovina',
    'Carne - Suína',
    'Aves',
    'Peixes',
    'Massas',
    'Frutas',
    'Grãos',

    'Veganas',
    'Vegetarianas',
    'Sem glúten',
    'Fit',
    'Saudáveis'
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const devUserId = '00000000-0000-0000-0000-000000000001';
  const bcrypt = require('bcrypt');
  const hashed = bcrypt.hashSync(process.env.DEV_USER_PASSWORD ?? 'password', 10);
  await prisma.user.upsert({
    where: { login: 'dev' },
    update: {},
    create: { id: devUserId, name: 'Dev User', login: 'dev', password: hashed }
  });

  console.log('Seed: categories upserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
