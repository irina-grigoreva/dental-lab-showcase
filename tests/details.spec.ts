import { test, expect } from '@playwright/test';

const pages = ['/', '/shop/', '/product/kit/', '/notes/', '/about/'];

for (const path of pages) {
  test(`${path}: every image has alt text, the page has a language and a title`, async ({ page }) => {
    await page.goto(path);
    const missingAlt = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.src));
    expect(missingAlt, missingAlt.join('\n')).toEqual([]);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title()).not.toBe('');
  });
}

test('keyboard focus is visible on the first links of the header', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // logo
  const focusedStyle = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { tag: el.tagName, outline: s.outlineStyle, shadow: s.boxShadow };
  });
  const visible = (focusedStyle.outline !== 'none' && focusedStyle.outline !== '') || (focusedStyle.shadow !== 'none' && focusedStyle.shadow !== '');
  expect(visible, JSON.stringify(focusedStyle)).toBe(true);
});

test('skip link jumps to the main content', async ({ page }) => {
  await page.goto('/shop/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});
