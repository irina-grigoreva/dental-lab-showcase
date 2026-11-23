import { test, expect } from '@playwright/test';

test('logo intro is recorded on the first visit and skipped on later pages', async ({ page }) => {
  // The intro runs once per tab: the first page marks the session, so later pages skip it.
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('elident-intro-seen'))).toBe('1');

  await page.goto('/shop/');
  await expect(page.locator('[data-intro]')).toHaveCount(0);
  await expect(page.locator('.hdr')).toBeVisible();
});

test('FAQ question opens and closes its answer', async ({ page }) => {
  await page.goto('/');
  const item = page.locator('.faq-item').nth(1);
  const button = item.locator('.faq-q');
  await button.scrollIntoViewIfNeeded();
  await expect(item).not.toHaveClass(/is-open/);
  await button.click();
  await expect(item).toHaveClass(/is-open/);
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await button.click();
  await expect(item).not.toHaveClass(/is-open/);
});

test('disposable cost estimate updates with the slider', async ({ page }) => {
  await page.goto('/');
  const range = page.locator('[data-calc-range]');
  await range.scrollIntoViewIfNeeded();
  await page.locator('[data-calc-toggle]').click();
  await range.fill('120');
  await expect(page.locator('[data-calc-out]')).toHaveText('120');
  await expect(page.locator('[data-calc-used]')).toHaveText('$240.00');
  await expect(page.locator('[data-calc-bought]')).toHaveText('$300.00');
});

test('shop filter shows only the chosen format', async ({ page }) => {
  await page.goto('/shop/');
  await page.locator('[data-filter="kit"]').click();
  await expect(page.locator('[data-count]')).toHaveText('Showing 1 product');
  await expect(page.locator('.xprod:not(.is-hidden)')).toHaveCount(1);
  await expect(page.locator('[data-filter="kit"]')).toHaveAttribute('aria-pressed', 'true');
});

test('order form reports missing fields and then confirms a valid request', async ({ page }) => {
  await page.goto('/product/reusable/');
  await page.locator('[data-order-btn]').click();
  await expect(page.locator('#err-name')).not.toHaveText('');

  await page.locator('input[name="name"]').fill('Test Technician');
  await page.locator('input[name="lab"]').fill('Test Lab');
  await page.locator('input[name="email"]').fill('tech@example.com');
  await page.locator('[data-order-btn]').click();
  await expect(page.locator('[data-order-done]')).toBeVisible({ timeout: 5_000 });
});

test('clicking a menu link changes the page', async ({ page }) => {
  await page.goto('/');
  const shop = page.locator('header.hdr .nav-link', { hasText: 'Shop' });
  if (!(await shop.isVisible())) {
    await page.locator('[data-menu-btn]').click();
    await page.locator('[data-sheet] a', { hasText: 'Shop' }).click();
  } else {
    await shop.click();
  }
  await page.waitForURL(/\/shop\/?$/, { timeout: 10_000 });
  await expect(page.locator('h1').first()).toContainText('shop');
});
