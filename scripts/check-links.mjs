// Verifies the built site in dist/: every internal href/src resolves to a file, and every
// #fragment points at an id that exists on the target page. Run after `astro build`.
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = join(process.cwd(), 'dist');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    return d.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

const pages = walk(DIST);
const idsByFile = new Map();
const idsOf = (file) => {
  if (!idsByFile.has(file)) {
    const html = readFileSync(file, 'utf8');
    idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsByFile.get(file);
};

// Maps a site path (e.g. /shop/ or /_blob/x) to a file inside dist/, or null.
function resolvePath(path) {
  const clean = decodeURIComponent(path);
  const candidates = clean.endsWith('/')
    ? [join(DIST, clean, 'index.html')]
    : [join(DIST, clean), join(DIST, clean, 'index.html'), join(DIST, clean + '.html')];
  return candidates.find((f) => existsSync(f) && statSync(f).isFile()) ?? null;
}

const errors = [];
let checked = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const where = relative(DIST, page).split(sep).join('/');
  const refs = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (!ref.startsWith('/') || ref.startsWith('//')) continue; // external or protocol-relative: skipped
    checked++;
    const [pathPart, hash] = ref.split('#');
    const path = pathPart.split('?')[0] || '/';
    const file = resolvePath(path);
    if (!file) {
      errors.push(`${where}: missing target ${ref}`);
      continue;
    }
    if (hash && file.endsWith('.html') && !idsOf(file).has(decodeURIComponent(hash))) {
      errors.push(`${where}: no #${hash} on ${path}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} broken reference(s) out of ${checked} internal references.`);
  process.exit(1);
}
console.log(`OK: ${checked} internal references across ${pages.length} pages resolve.`);
