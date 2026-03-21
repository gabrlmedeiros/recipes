import * as amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

const QUEUE = 'print_recipe';

async function run(): Promise<void> {
  const prisma = new PrismaClient();
  const url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672';
  const conn: any = await amqp.connect(url);
  const ch: any = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });

  try {
    const pending = await prisma.printJob.findMany({ where: { status: 'PENDING' } });
    console.log('requeue-pending: found', pending.length, 'pending jobs');
    for (const job of pending) {
      const msg = { recipeId: job.recipeId, jobId: job.id, requestedBy: job.requestedBy };
      ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(msg)), { persistent: true });
      console.log('requeue-pending: published', job.id);
    }
  } finally {
    try {
      await ch.close();
    } catch (e) { void e; }
    try {
      await conn.close();
    } catch (e) { void e; }
    await prisma.$disconnect();
    console.log('requeue-pending: done');
  }
}

run().catch((e) => {
  console.error('requeue-pending: fatal', e);
  process.exit(1);
});
