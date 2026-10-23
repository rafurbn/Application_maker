import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconSvg = readFileSync(path.join(root, 'public', 'icon.svg'), 'utf8');
const iconDataUri = `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}`;

const pill = (x, y, w, text) => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="52" rx="26" fill="#065f46" stroke="#10b981" stroke-width="2" />
    <text x="${x + w / 2}" y="${y + 35}" text-anchor="middle" font-family="Noto Sans Bengali, system-ui, sans-serif" font-size="24" font-weight="600" fill="#a7f3d0">${text}</text>
  </g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="55%" stop-color="#044e3b" />
      <stop offset="100%" stop-color="#01352a" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="26" y="26" width="1148" height="578" rx="34" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3" />

  <image href="${iconDataUri}" x="72" y="176" width="240" height="240" />

  <text x="368" y="212" font-family="Noto Sans Bengali, system-ui, sans-serif" font-size="64" font-weight="700" fill="#ffffff">অফিসিয়াল দরখাস্ত</text>
  <text x="368" y="290" font-family="Noto Sans Bengali, system-ui, sans-serif" font-size="64" font-weight="700" fill="#fbbf24">প্রস্তুতকারক</text>
  <text x="368" y="352" font-family="Noto Sans Bengali, system-ui, sans-serif" font-size="28" fill="#d1fae5">সরকারি প্রাথমিক বিদ্যালয়ের শিক্ষক ও শিক্ষার্থীদের জন্য</text>

  ${pill(368, 404, 250, '১৫টি ফরম্যাট')}
  ${pill(636, 404, 250, 'A4 প্রিন্ট-রেডি')}
  ${pill(904, 404, 226, 'লগইন ছাড়াই')}

  <text x="368" y="540" font-family="Noto Sans Bengali, system-ui, sans-serif" font-size="26" fill="#6ee7b7">লিংকে ক্লিক করেই ইনস্টল করুন — মোবাইল ও পিসি দুটোতেই</text>
</svg>`;

const out = path.join(root, 'public', 'og-image.png');
const info = await sharp(Buffer.from(svg), { density: 96 }).resize(1200, 630, { fit: 'fill' }).png().toFile(out);
console.log(`created public/og-image.png ${info.width}x${info.height}`);
