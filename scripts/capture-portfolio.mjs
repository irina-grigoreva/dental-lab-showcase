// Captures README screenshots and a short scroll video of the built site.
// Run after `npm run build` with the preview server up (see `npm run preview`).
import { chromium, devices } from '@playwright/test';
import { mkdirSync, renameSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'docs', 'screenshots');
mkdirSync(OUT, { recursive: true });
const base = 'http://127.0.0.1:4321';
const shots = [
  { name: 'home-desktop', path: '/', size: { viewport: { width: 1440, height: 900 } } },
  { name: 'shop-desktop', path: '/shop/', size: { viewport: { width: 1440, height: 900 } } },
  { name: 'product-desktop', path: '/product/reusable/', size: { viewport: { width: 1440, height: 900 } } },
  { name: 'notes-desktop', path: '/notes/', size: { viewport: { width: 1440, height: 900 } } },
  { name: 'home-phone', path: '/', size: { ...devices['Pixel 7'] } },
  { name: 'shop-phone', path: '/shop/', size: { ...devices['Pixel 7'] } },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({ ...s.size, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + s.path, { waitUntil: 'load' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(OUT, `${s.name}.png`) });
  await ctx.close();
}

// Scroll video: the home page with motion on, so the reveals, the pinned steps and the transitions play.
const videoDir = join(OUT, '_video');
mkdirSync(videoDir, { recursive: true });
const vctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } } });
const vpage = await vctx.newPage();
await vpage.goto(base + '/', { waitUntil: 'load' });
await vpage.waitForTimeout(3000);
for (let y = 0; y < 9000; y += 120) {
  await vpage.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
  await vpage.waitForTimeout(60);
}
await vpage.waitForTimeout(800);
await vctx.close();
const webm = readdirSync(videoDir).find((f) => f.endsWith('.webm'));
if (webm) renameSync(join(videoDir, webm), join(OUT, 'home-scroll.webm'));
await browser.close();
console.log('captured', shots.length, 'screenshots and the scroll video');
