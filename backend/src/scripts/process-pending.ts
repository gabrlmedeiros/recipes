import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const QUEUE = 'print_recipe';

async function run(): Promise<void> {
  const prisma = new PrismaClient();
  const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672';
  const conn: any = await amqp.connect(url);
  const ch: any = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });

  try {
    let keep = true;
    while (keep) {
      const msg = await ch.get(QUEUE, { noAck: false });
      if (!msg) {
        keep = false;
        break;
      }

      try {
        const payload = JSON.parse(msg.content.toString()) as {
          recipeId?: string;
          jobId?: string;
          requestedBy?: string;
        };
        const recipeId = payload.recipeId;
        const jobId = payload.jobId;

        if (!recipeId) {
          console.error('process-pending: missing recipeId', payload);
          ch.ack(msg);
          continue;
        }

        const recipe = await prisma.recipe.findUnique({
          where: { id: recipeId },
          include: { category: true, user: true },
        });

        if (!recipe) {
          console.error('process-pending: recipe not found', recipeId);
          ch.ack(msg);
          continue;
        }

        if (jobId) {
          await prisma.printJob.update({ where: { id: jobId }, data: { status: 'PROCESSING' } }).catch(() => null);
        }

        const content = [
          `Receita: ${recipe.name}`,
          `Categoria: ${recipe.category?.name ?? '—'}`,
          `Porções: ${recipe.servings ?? '—'}`,
          `Tempo: ${recipe.prepTimeMinutes ?? '—'} min`,
          '',
          'Ingredientes:',
          recipe.ingredients ?? '',
          '',
          'Modo de preparo:',
          recipe.prepMethod ?? '',
        ].join('\n');

        const outDir = process.env.PRINT_OUT_DIR ?? '/tmp/recipe_prints';
        fs.mkdirSync(outDir, { recursive: true });
        const filePath = path.join(outDir, `recipe-${recipeId}.txt`);
        fs.writeFileSync(filePath, content, 'utf8');

        if (jobId) {
          await prisma.printJob.update({ where: { id: jobId }, data: { status: 'DONE', filePath } }).catch(() => null);
        }

        ch.ack(msg);
        console.log('process-pending: processed', jobId ?? '(no-jobId)');
      } catch (err) {
        console.error('process-pending: error', err);
        try {
          const payload = (() => {
            try {
              return JSON.parse(msg.content.toString());
            } catch {
              return {};
            }
          })();
          const jobId = payload.jobId as string | undefined;
          if (jobId) await prisma.printJob.update({ where: { id: jobId }, data: { status: 'FAILED', error: String(err) } }).catch(() => null);
          if (msg) ch.nack(msg, false, false);
        } catch (e) {
          console.error('process-pending: failed to nack', e);
        }
      }
    }
  } finally {
    try {
      await ch.close();
    } catch (e) { void e; }
    try {
      await conn.close();
    } catch (e) { void e; }
    await prisma.$disconnect();
    console.log('process-pending: done');
  }
}

run().catch((e) => {
  console.error('process-pending: fatal', e);
  process.exit(1);
});
