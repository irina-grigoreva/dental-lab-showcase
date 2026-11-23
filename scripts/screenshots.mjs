// Full-page screenshots of every page at desktop and phone widths, for design review.
// Usage: node scripts/screenshots.mjs <output-dir> [--motion]
// Without --motion the page is rendered with reduced motion, so every section is visible at once.
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'screenshots';
const motion = process.argv.includes('--motion');
const pages = { home: '/', shop: '/shop/', reusable: '/product/reusable/', kit: '/product/kit/', notes: '/notes/', note: '/notes/reusable-vs-disposable/', about: '/about/', notfound: '/nope/' };
const sizes = { desktop: { viewport: { width: 1440, height: 900 } }, phone: { ...devices['Pixel 7'] } };

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [sizeName, size] of Object.entries(sizes)) {
  for (const [name, path] of Object.entries(pages)) {
    const ctx = await browser.newContext({ ...size, reducedMotion: motion ? 'no-preference' : 'reduce' });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:4321' + path, { waitUntil: 'load' });
    // Scroll the whole page once so lazy images load before the full-page capture.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(out, `${name}-${sizeName}.png`), fullPage: true });
    await ctx.close();
  }
}
await browser.close();
console.log('saved to', out);
