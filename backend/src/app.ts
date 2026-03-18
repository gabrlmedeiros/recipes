import 'dotenv/config';
import { buildApp } from './app-factory.js';

const app = await buildApp({ logger: true });

app.listen({ port: Number(process.env['PORT'] ?? 3000), host: '0.0.0.0' });
