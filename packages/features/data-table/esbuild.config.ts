import { resolve } from 'node:path';

import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcss from 'postcss';

import copyStaticFiles from 'esbuild-copy-static-files';
import { sassPlugin } from 'esbuild-sass-plugin';
import { type BuildOptions, build, context } from 'esbuild';

// check if watch mode is enabled
const isWatchMode = process.argv.includes('--watch');

// prepare esbuild options
const options: BuildOptions = {
  sourceRoot: 'src',
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  platform: 'browser',
  format: 'esm',
  bundle: true,
  metafile: true,
  minify: true,
  treeShaking: true,
  sourcemap: true,
  plugins: [
    // @ts-ignore https://github.com/glromeo/esbuild-sass-plugin/issues/109#issuecomment-1353194294
    sassPlugin({
      type: 'css-text',
      async transform(source: string) {
        const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })]).process(
          source,
          { from: source },
        );
        return css;
      },
      importMapper(path: string) {
        if (path.includes('node_modules')) return path;
        if (path.includes('@')) return resolve(path.replace(/^.*@\/?/, './src/'));
        return path;
      },
    }),
  ],
};

if (isWatchMode) {
  try {
    // build in watch mode
    const green = (message: string) => `\u001b[32m${message}\u001b[0m`;
    const cyan = (message: string) => `\u001b[36m${message}\u001b[0m`;
    const js = ` new EventSource('/esbuild').addEventListener('change', () => location.reload())`;
    const ctx = await context({
      ...options,
      entryPoints: [...(options.entryPoints as string[]), 'src/index.html'],
      plugins: [...options.plugins!, copyStaticFiles({ src: './src/index.json', dest: './dist/index.json' })],
      loader: { '.html': 'copy' },
      banner: { js },
    });
    await ctx.watch();

    // start dev server
    const { host, port } = await ctx.serve({ servedir: 'dist', port: 3510 });

    // notify user
    console.info(`${green('>')} Server started at ${cyan(`http://${host}:${port}`)}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
} else {
  build(options);
}
