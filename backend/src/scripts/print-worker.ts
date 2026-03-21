import amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { existsSync } from 'fs';

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://localhost';
const QUEUE = 'print_recipe';
const OUT_DIR = process.env.PRINT_OUT_DIR ?? '/tmp/recipe_prints';

const prisma = new PrismaClient();

async function ensureOutDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

function renderRecipeHTML(recipe: any) {
  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.join('\n')
    : String(recipe.ingredients ?? '').replace(/\n/g, '<br/>');
  const prep = Array.isArray(recipe.prepMethod) ? recipe.prepMethod.join('<br/>') : String(recipe.prepMethod ?? '').replace(/\n/g, '<br/>');
  return `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(recipe.name)}</title>
    <style>
      body{font-family: Arial, Helvetica, sans-serif;margin:24px;color:#111}
      h1{font-size:22px;margin-bottom:8px}
      .meta{color:#666;font-size:12px;margin-bottom:16px}
      .section{margin-top:12px}
      .section h2{font-size:16px;margin-bottom:6px}
      .ingredients, .prep{font-size:14px;line-height:1.4}
      .ingredients li{margin-bottom:4px}
    </style>
  </head>
  <body>
    <h1>${escapeHtml(recipe.name)}</h1>
    <div class="meta">Categoria: ${escapeHtml(recipe.category?.name ?? '—')}</div>
    <div class="meta">Porções: ${escapeHtml(String(recipe.servings ?? '—'))}</div>
    <div class="meta">Tempo: ${escapeHtml(String(recipe.prepTimeMinutes ?? '—'))} min</div>

    <div class="section">
      <h2>Ingredientes</h2>
      <div class="ingredients">${convertToListHTML(ingredients)}</div>
    </div>

    <div class="section">
      <h2>Modo de preparo</h2>
      <div class="prep">${prep}</div>
    </div>
  </body>
  </html>`;
}

function convertToListHTML(raw: string) {
  if (!raw) return '';
  const items = raw.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean);
  if (items.length === 0) return escapeHtml(raw).replace(/\n/g, '<br/>');
  return `<ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function handleMessage(msg: amqp.ConsumeMessage | null, channel: amqp.Channel) {
  if (!msg) return;
  try {
    const payload = JSON.parse(msg.content.toString());
    const recipeId = payload.recipeId as string;
    const jobId = payload.jobId as string | undefined;
    if (!recipeId) {
      console.error('print-worker: missing recipeId in payload', payload);
      channel.ack(msg);
      return;
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { category: true, user: true },
    });

    if (!recipe) {
      console.error('print-worker: recipe not found', recipeId);
      channel.ack(msg);
      return;
    }

    if (jobId) {
      await prisma.printJob.update({ where: { id: jobId }, data: { status: 'PROCESSING' } }).catch(() => null);
    }

    await ensureOutDir();
    const html = renderRecipeHTML(recipe);
    const filePath = path.join(OUT_DIR, `recipe-${recipeId}.pdf`);
    const launchOptions: any = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };
    const candidates = [process.env.PUPPETEER_EXECUTABLE_PATH, '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/chromium-stable', '/usr/bin/google-chrome-stable'].filter(Boolean) as string[];
    const found = candidates.find(p => p && existsSync(p));
    if (found) launchOptions.executablePath = found;
    launchOptions.headless = 'new';
    console.log('print-worker: launching puppeteer with executablePath=', launchOptions.executablePath ?? '<auto>');
    const browser = await puppeteer.launch(launchOptions);
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({ path: filePath, format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '16mm', right: '16mm' } });
      console.log(`print-worker: wrote print file ${filePath}`);
      if (jobId) {
        await prisma.printJob.update({ where: { id: jobId }, data: { status: 'DONE', filePath } }).catch(() => null);
      }
    } finally {
      await browser.close();
    }

    channel.ack(msg);
  } catch (err) {
    console.error('print-worker: error processing message', err);
    try {
      const payload = (() => { try { return JSON.parse(msg?.content.toString() || '{}'); } catch { return {}; } })();
      const jobId = payload.jobId as string | undefined;
      if (jobId) await prisma.printJob.update({ where: { id: jobId }, data: { status: 'FAILED', error: String(err) } }).catch(() => null);
      channel.nack(msg, false, false);
    } catch (e) {
      console.error('print-worker: failed to nack', e);
    }
  }
}

async function run() {
  console.log('print-worker: connecting to RabbitMQ', RABBITMQ_URL);
  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE, { durable: true });
  await ensureOutDir();

  await channel.consume(QUEUE, (msg) => { void handleMessage(msg, channel); }, { noAck: false });

  const cleanup = async () => {
    try {
      await channel.close();
      await conn.close();
    } catch (e) {
      // ignore
    }
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => { void cleanup(); });
  process.on('SIGTERM', () => { void cleanup(); });

  console.log('print-worker: waiting for messages on', QUEUE);
}

run().catch((err) => {
  console.error('print-worker: fatal error', err);
  void prisma.$disconnect().finally(() => process.exit(1));
});
