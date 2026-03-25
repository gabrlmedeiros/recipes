import { test, expect, type Route } from '@playwright/test';

const mockToken = 'mock-token';

test('Fluxo de impressão da receita (simulado)', async ({ page }) => {
  const recipeId = '11111111-1111-1111-1111-111111111111';
  const jobId = 'j-123';

  await page.goto('/login');
  await page.evaluate(({ token }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id: 'u1', name: 'Usuário' }));
  }, { token: mockToken });

  await page.route((url) => url.port === '3000' && url.pathname === `/recipes/${recipeId}`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: recipeId,
          name: 'Receita Teste',
          prepTimeMinutes: 30,
          servings: 2,
          prepMethod: 'Fazer coisas',
          ingredients: ['a', 'b'],
          category: { id: 'c1', name: 'Teste' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        error: null,
      }),
    });
  });

  // Intercepta POST /prints/:id e retorna jobId
  await page.route(`**/prints/${recipeId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { jobId }, error: null }),
    });
  });

  // Intercepta polling GET /prints/:jobId/status -> primeiro retorna PENDING, depois DONE
  let pollCount = 0;
  await page.route(`**/prints/${jobId}/status`, async (route) => {
    pollCount += 1;
    const status = pollCount < 2 ? 'PENDING' : 'DONE';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { status }, error: null }),
    });
  });

  // Intercepta download do PDF
  await page.route(`**/prints/${jobId}/download`, async (route) => {
    const pdfBytes = Buffer.from('%PDF-1.4\n%ããã\n');
    await route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/pdf' },
      body: pdfBytes,
    });
  });

  // Ir para a página da receita
  await page.goto(`/recipes/${recipeId}`);

  // Espera o botão ficar visível
  await page.getByText('Imprimir').waitFor({ state: 'visible', timeout: 5000 });

  // Prepare to capture POST and download requests
  const postPromise = page.waitForRequest(`**/prints/${recipeId}`);
  const downloadPromise = page.waitForRequest(`**/prints/${jobId}/download`);

  // Clicar no botão 'Imprimir'
  await page.click('text=Imprimir');

  // Esperar o polling completar (status DONE)
  await page.waitForResponse((resp) => resp.url().includes(`/prints/${jobId}/status`) && resp.status() === 200, { timeout: 5000 });

  // Verifica que o POST foi chamado e que o download foi solicitado
  const postCall = await postPromise;
  expect(postCall).toBeTruthy();

  const downloadCall = await downloadPromise;
  expect(downloadCall).toBeTruthy();
});
