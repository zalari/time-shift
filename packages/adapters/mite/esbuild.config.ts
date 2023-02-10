import { parseArgs } from 'node:util';

import stdLibBrowserPlugin from 'node-stdlib-browser/helpers/esbuild/plugin';
import stdLibBrowser from 'node-stdlib-browser';

import { type BuildOptions, context, build } from 'esbuild';

const {
  values: { watch },
} = parseArgs({
  options: {
    watch: {
      type: 'boolean',
      alias: 'w',
    },
  },
});

const options: BuildOptions = {
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
};

try {
  if (watch) {
    const ctx = await context(options);
    await ctx.watch();
  } else {
    await build(options);
  }
} catch (error) {
  process.exit(1);
}
