import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

const kb = (bytes) => (bytes / 1024).toFixed(1).padStart(7);

let html;
try {
  html = readFileSync(path.join(dist, 'index.html'), 'utf8');
} catch {
  console.error('dist/index.html নেই — আগে `npm run build` চালান।');
  process.exit(1);
}

const entryJs = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]);
const entryCss = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map((m) => m[1]);
const critical = ['/index.html', ...entryJs, ...entryCss];

const files = new Set();
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else files.add('/' + path.relative(dist, full).replace(/\\/g, '/'));
  }
};
walk(dist);

let criticalTotal = 0;
console.log('\nপ্রথম লোড (এই ফাইলগুলোই 2G/3G ইউজারের আগে নামে):');
for (const ref of critical) {
  const rel = ref.replace(/^\//, '');
  if (!files.has(ref)) {
    console.log(`  ${kb(0)} kB gzip  ${rel} (ডিস্টে নেই!)`);
    continue;
  }
  const gzip = gzipSync(readFileSync(path.join(dist, rel))).length;
  criticalTotal += gzip;
  console.log(`  ${kb(gzip)} kB gzip  ${rel}`);
}

const lazy = [...files]
  .filter((f) => f.startsWith('/assets/') && !critical.includes(f))
  .map((f) => ({ f, gzip: gzipSync(readFileSync(path.join(dist, f))).length }))
  .sort((a, b) => b.gzip - a.gzip);

console.log('\nধীরে লোড হয় (শুধু দরকার হলে):');
for (const { f, gzip } of lazy) console.log(`  ${kb(gzip)} kB gzip  ${f.replace('/assets/', '')}`);

const budget = 160 * 1024;
const verdict = criticalTotal <= budget ? 'বাজেটের মধ্যে আছে' : 'বাজেট ছাড়িয়েছে';
console.log(`\nমোট প্রথম লোড: ${(criticalTotal / 1024).toFixed(1)} kB gzip — লক্ষ্য ${budget / 1024} kB — ${verdict}`);
console.log('(বাংলা ফন্টগুলো ব্রাউজার আলাদা করে ক্যাশ করে; Google Fonts থেকে আসে।)\n');
