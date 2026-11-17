import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export default defineConfig({
  plugins: [react(), {
    name: 'azheritage-build-manifest',
    closeBundle() {
      const list = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? list(join(directory, entry.name)) : [relative('dist', join(directory, entry.name)).replaceAll('\\', '/')]);
      writeFileSync('dist/build-manifest.json', JSON.stringify({ version: 1, files: [...list('dist').filter(path => path !== 'build-manifest.json'), 'build-manifest.json'] }));
    },
  }],
  server: { host: '0.0.0.0', port: 3000 },
  preview: { host: '0.0.0.0', port: 3000 },
});
