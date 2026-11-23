import { test, expect } from '@playwright/test';

const pages = ['/', '/shop/', '/product/reusable/', '/product/disposable/', '/product/kit/', '/notes/', '/notes/reusable-vs-disposable/', '/about/'];

for (const path of pages) {
  test(`page ${path} renders without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('footer.ftr')).toBeAttached();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test(`page ${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('unknown address shows the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('off the bench');
});

test('footer address links to Google Maps', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('footer.ftr address a').first();
  await expect(link).toHaveAttribute('href', /google\.com\/maps/);
  await expect(link).toHaveAttribute('target', '_blank');
});
