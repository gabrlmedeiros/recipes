import { test, expect, type Page, type Route } from '@playwright/test';

const API = 'http://localhost:3000';

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6OTk5OTk5OTk5OX0.mock';
const mockUser = { id: '00000000-0000-0000-0000-000000000001', name: 'João Silva', login: 'joaosilva' };

const mockCategory = { id: '00000000-0000-0000-0000-000000000002', name: 'Almoço' };

const mockRecipe = {
  id: '00000000-0000-0000-0000-000000000003',
  name: 'Bolo de cenoura',
  prepTimeMinutes: 60,
  servings: 8,
  prepMethod: 'Misture tudo e asse.',
  ingredients: '2 cenouras, 3 ovos',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  category: mockCategory,
  user: mockUser,
};

async function setAuth(page: Page) {
  await page.goto('/login');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token: mockToken, user: mockUser },
  );
}

async function mockRecipesList(page: Page, recipes: typeof mockRecipe[] = []) {
    await page.route(
      (url) => url.port === '3000' && url.pathname.startsWith('/recipes'),
    (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            recipes,
            pagination: { page: 1, limit: 10, total: recipes.length, totalPages: Math.ceil(recipes.length / 10) || 0 },
          },
          error: null,
        }),
      }),
  );
}

async function mockCategories(page: Page) {
  await page.route(`${API}/recipes/categories`, (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [mockCategory], error: null }),
    }),
  );
}

// ─── Listagem ─────────────────────────────────────────────────────────────────

test.describe('Página de receitas — listagem', () => {
  test('exibe estado vazio quando não há receitas', async ({ page }) => {
    await setAuth(page);
    await mockRecipesList(page, []);
    await page.goto('/recipes');

    await expect(page.getByText('Nenhuma receita ainda')).toBeVisible();
    await expect(page.getByText('Clique em "Nova receita" para começar')).toBeVisible();
  });

  test('exibe receitas quando há dados', async ({ page }) => {
    await setAuth(page);
    await mockRecipesList(page, [mockRecipe]);
    await page.goto('/recipes');

    await expect(page.getByText('Bolo de cenoura')).toBeVisible();
    await expect(page.getByText('Almoço')).toBeVisible();
    await expect(page.getByText('60 min')).toBeVisible();
    await expect(page.getByText('8 porção')).toBeVisible();
  });

  test('redireciona para /login se não autenticado', async ({ page }) => {
    await page.goto('/recipes');
    await expect(page).toHaveURL('/login');
  });

  test('exibe botão "Nova receita"', async ({ page }) => {
    await setAuth(page);
    await mockRecipesList(page, []);
    await page.goto('/recipes');

    await expect(page.getByRole('button', { name: '+ Nova receita' })).toBeVisible();
  });
});

// ─── Criação ──────────────────────────────────────────────────────────────────

test.describe('Página de receitas — criação', () => {
  test.beforeEach(async ({ page }) => {
    await setAuth(page);
    await mockCategories(page);
    await mockRecipesList(page, []);
    await page.goto('/recipes');
  });

  test('abre o modal ao clicar em Nova receita', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nova receita' }).click();

    await expect(page.getByRole('heading', { name: 'Nova receita' })).toBeVisible();
  });

  test('cria receita com sucesso e a insere na lista', async ({ page }) => {
    await page.route(`${API}/recipes`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockRecipe, error: null }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { recipes: [mockRecipe], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } }, error: null }),
        });
      }
    });

    await page.getByRole('button', { name: '+ Nova receita' }).click();
    await expect(page.getByRole('heading', { name: 'Nova receita' })).toBeVisible();
    await page.getByPlaceholder('Ex: Bolo de cenoura').fill('Bolo de cenoura');
    await page.getByPlaceholder('Ex: 60').fill('60');
    await page.getByPlaceholder('Ex: 4').fill('8');
    await page.getByPlaceholder('Liste os ingredientes...').fill('2 cenouras, 3 ovos');
    await page.getByPlaceholder('Descreva o passo a passo...').fill('Misture tudo e asse.');
    await page.getByRole('button', { name: 'Criar receita' }).click();

    await page.route(
      (url) => url.port === '3000' && url.pathname.startsWith('/recipes'),
      (route: Route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { recipes: [mockRecipe], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } }, error: null }),
        }),
    );

    await expect(page.getByText('Bolo de cenoura')).toBeVisible();
  });

  test('exibe erro quando criação falha', async ({ page }) => {
    await page.route(`${API}/recipes`, async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ data: null, error: { message: 'Erro ao salvar receita.' } }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: '+ Nova receita' }).click();
    await expect(page.getByRole('heading', { name: 'Nova receita' })).toBeVisible();
    await page.getByRole('button', { name: 'Criar receita' }).click();

    await expect(page.getByText('Erro ao salvar receita.')).toBeVisible();
  });

  test('fecha o modal ao clicar em Cancelar', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nova receita' }).click();
    await expect(page.getByRole('heading', { name: 'Nova receita' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('heading', { name: 'Nova receita' })).not.toBeVisible();
  });
});

// ─── Edição ───────────────────────────────────────────────────────────────────

test.describe('Página de receitas — edição', () => {
  test.beforeEach(async ({ page }) => {
    await setAuth(page);
    await mockCategories(page);
    await mockRecipesList(page, [mockRecipe]);
    await page.goto('/recipes');
  });

  test('abre o modal de edição ao clicar no botão editar', async ({ page }) => {
    await page.getByTitle('Editar').click();

    await expect(page.getByText('Editar receita')).toBeVisible();
    await expect(page.getByPlaceholder('Ex: Bolo de cenoura')).toHaveValue('Bolo de cenoura');
  });

  test('atualiza receita com sucesso', async ({ page }) => {
    const updated = { ...mockRecipe, name: 'Bolo de baunilha' };
    await page.route(`${API}/recipes/${mockRecipe.id}`, async (route: Route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: updated, error: null }),
        });
      } else {
        await route.continue();
      }
    });

    // ensure GET /recipes will return the updated item after save
    await page.route(
      (url) => url.port === '3000' && url.pathname.startsWith('/recipes'),
      (route: Route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { recipes: [{ ...mockRecipe, name: 'Bolo de baunilha' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } }, error: null }),
        }),
    );

    await page.getByTitle('Editar').click();
    await expect(page.getByText('Editar receita')).toBeVisible();
    await page.getByPlaceholder('Ex: Bolo de cenoura').fill('Bolo de baunilha');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await page.route(
      (url) => url.port === '3000' && url.pathname.startsWith('/recipes'),
      (route: Route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { recipes: [{ ...mockRecipe, name: 'Bolo de baunilha' }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } }, error: null }),
        }),
    );

    await expect(page.getByText('Bolo de baunilha')).toBeVisible();
  });
});

// ─── Exclusão ─────────────────────────────────────────────────────────────────

test.describe('Página de receitas — exclusão', () => {
  test.beforeEach(async ({ page }) => {
    await setAuth(page);
    await mockRecipesList(page, [mockRecipe]);
    await page.goto('/recipes');
  });

  test('exclui receita ao confirmar o diálogo', async ({ page }) => {
    await page.route(`${API}/recipes/${mockRecipe.id}`, async (route: Route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { success: true }, error: null }),
        });
      } else {
        await route.continue();
      }
    });

    await page.getByTitle('Excluir').click();
    await expect(page.getByText('Tem certeza')).toBeVisible();
    await page.getByRole('button', { name: 'Excluir' }).nth(1).click();

    await page.waitForResponse((resp) => resp.url().endsWith(`/recipes/${mockRecipe.id}`) && resp.request().method() === 'DELETE');

    await page.route(
      (url) => url.port === '3000' && url.pathname.startsWith('/recipes'),
      (route: Route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { recipes: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }, error: null }),
        }),
    );

    await expect(page.getByText('Bolo de cenoura')).not.toBeVisible();
  });

  test('não exclui quando o diálogo é cancelado', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByTitle('Excluir').click();

    await expect(page.getByText('Bolo de cenoura')).toBeVisible();
  });
});

// ─── Paginação ────────────────────────────────────────────────────────────────

test.describe('Página de receitas — paginação', () => {
  test('exibe controles de paginação quando totalPages > 1', async ({ page }) => {
    await setAuth(page);
    await page.route(
      (url) => url.port === '3000' && url.pathname.startsWith('/recipes'),
      (route: Route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              recipes: [mockRecipe],
              pagination: { page: 1, limit: 10, total: 15, totalPages: 2 },
            },
            error: null,
          }),
        }),
    );
    await page.goto('/recipes');

    await expect(page.getByRole('button', { name: /Próxima/ })).toBeVisible();
    await expect(page.getByText('1 / 2')).toBeVisible();
  });
});
