import 'dotenv/config';
import Fastify from 'fastify';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { recipeRoutes } from './modules/recipes/recipes.routes.js';

const app = Fastify({ logger: true });

app.setErrorHandler(errorHandler);

app.get('/health', async () => ({ data: { status: 'ok' }, error: null }));

app.register(authRoutes, { prefix: '/auth' });
app.register(userRoutes, { prefix: '/users' });
app.register(recipeRoutes, { prefix: '/recipes' });

app.listen({ port: Number(process.env['PORT'] ?? 3000), host: '0.0.0.0' });
