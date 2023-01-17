import { createServer, request } from 'http';
import { resolve } from 'path';

import stdLibBrowserPlugin from 'node-stdlib-browser/helpers/esbuild/plugin';
import stdLibBrowser from 'node-stdlib-browser';

import { build } from 'esbuild';

try {
  build({
    sourceRoot: 'src',
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    platform: 'browser',
    format: 'esm',
    bundle: true,
    metafile: true,
    minify: true,
    treeShaking: true,
    sourcemap: true,
    loader: { '.html': 'copy' },
    inject: ['node-stdlib-browser/helpers/esbuild/shim'],
    define: {
      global: 'global',
      process: 'process',
      Buffer: 'Buffer',
    },
    plugins: [stdLibBrowserPlugin(stdLibBrowser)],
  });
} catch (error) {
  process.exit(1);
}
