import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * public/ files are copied verbatim, so the service worker's cache name is stamped
 * here after the build. Without a per-deploy id the old cache never goes away.
 */
function stampServiceWorker(): Plugin {
  let buildId = 'dev';
  return {
    name: 'stamp-service-worker',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      buildId = `${config.define?.__APP_VERSION__?.replace(/"/g, '') || '0'}-${Date.now().toString(36)}`;
    },
    closeBundle() {
      const file = path.join(projectRoot, 'dist', 'sw.js');
      if (!fs.existsSync(file)) return;
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replaceAll('__BUILD_ID__', buildId));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stampServiceWorker()],
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    reportCompressedSize: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
