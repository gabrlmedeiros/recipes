import { test, expect, type Page, type Route } from '@playwright/test';

const API = 'http://localhost:3000';

const mockUser = { id: 1, name: 'João Silva', login: 'joaosilva' };
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6OTk5OTk5OTk5OX0.mock';

async function mockAuthSuccess(page: Page) {
  await page.route(`${API}/auth/login`, (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { token: mockToken, user: mockUser }, error: null }),
    }),
  );
  await page.route(`${API}/auth/register`, (route: Route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ data: { token: mockToken, user: mockUser }, error: null }),
    }),
  );
  await page.route(`${API}/auth/logout`, (route: Route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { success: true }, error: null }),
    }),
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────

test.describe('Página de login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('exibe o formulário de login corretamente', async ({ page }) => {
    await expect(page.getByText('Bem-vindo de volta')).toBeVisible();
    await expect(page.getByPlaceholder('Seu login')).toBeVisible();
    await expect(page.getByPlaceholder('Sua senha')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
  });

  test('redireciona para /recipes após login bem-sucedido', async ({ page }) => {
    await mockAuthSuccess(page);

    await page.getByPlaceholder('Seu login').fill('joaosilva');
    await page.getByPlaceholder('Sua senha').fill('senha123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/recipes');
  });

  test('exibe mensagem de erro com credenciais inválidas', async ({ page }) => {
    await page.route(`${API}/auth/login`, (route: Route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, error: { message: 'Login ou senha inválidos', code: 'INVALID_CREDENTIALS' } }),
      }),
    );

    await page.getByPlaceholder('Seu login').fill('joaosilva');
    await page.getByPlaceholder('Sua senha').fill('senha-errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Login ou senha inválidos')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('navega para página de cadastro ao clicar em "Criar conta"', async ({ page }) => {
    await page.getByRole('link', { name: 'Criar conta' }).click();
    await expect(page).toHaveURL('/register');
  });

  test('botão de mostrar/ocultar senha funciona', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Sua senha');
    await passwordInput.fill('senha123');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await page.locator('button[type="button"]').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

// ─── Cadastro ────────────────────────────────────────────────────────────────

test.describe('Página de cadastro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('exibe o formulário de cadastro corretamente', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Criar conta' })).toBeVisible();
    await expect(page.getByPlaceholder('Seu nome')).toBeVisible();
    await expect(page.getByPlaceholder('Seu login')).toBeVisible();
    await expect(page.getByPlaceholder('Mínimo 6 caracteres')).toBeVisible();
  });

  test('redireciona para /recipes após cadastro bem-sucedido', async ({ page }) => {
    await mockAuthSuccess(page);

    await page.getByPlaceholder('Seu nome').fill('João Silva');
    await page.getByPlaceholder('Seu login').fill('joaosilva');
    await page.getByPlaceholder('Mínimo 6 caracteres').fill('senha123');
    await page.getByPlaceholder('••••••••').fill('senha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page).toHaveURL('/recipes');
  });

  test('exibe erro quando as senhas não coincidem', async ({ page }) => {
    await page.getByPlaceholder('Seu nome').fill('João Silva');
    await page.getByPlaceholder('Seu login').fill('joaosilva');
    await page.getByPlaceholder('Mínimo 6 caracteres').fill('senha123');
    await page.getByPlaceholder('••••••••').fill('senhadiferente');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('As senhas não coincidem.')).toBeVisible();
  });

  test('exibe erro quando login já está em uso', async ({ page }) => {
    await page.route(`${API}/auth/register`, (route: Route) =>
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ data: null, error: { message: 'Login já está em uso', code: 'LOGIN_TAKEN' } }),
      }),
    );

    await page.getByPlaceholder('Seu nome').fill('Outro');
    await page.getByPlaceholder('Seu login').fill('joaosilva');
    await page.getByPlaceholder('Mínimo 6 caracteres').fill('senha123');
    await page.getByPlaceholder('••••••••').fill('senha123');
    await page.getByRole('button', { name: 'Criar conta' }).click();

    await expect(page.getByText('Login já está em uso')).toBeVisible();
  });
});

// ─── Receitas / Logout ───────────────────────────────────────────────────────

test.describe('Página de receitas', () => {
  test.beforeEach(async ({ page }) => {
    // Injeta token válido no localStorage para simular usuário autenticado
    await page.goto('/login');
    await page.evaluate(
      ({ token, user }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },
      { token: mockToken, user: mockUser },
    );
    await page.goto('/recipes');
  });

  test('exibe a página de receitas para usuário autenticado', async ({ page }) => {
    await expect(page.getByText('🍽️ Receitas')).toBeVisible();
    await expect(page.getByText('Nenhuma receita ainda')).toBeVisible();
  });

  test('realiza logout e redireciona para /login', async ({ page }) => {
    await page.route(`${API}/auth/logout`, (route: Route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true }, error: null }),
      }),
    );

    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('redireciona para /login se não estiver autenticado', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/recipes');
    await expect(page).toHaveURL('/login');
  });
});
