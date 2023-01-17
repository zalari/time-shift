import { createServer, request as httpRequest } from 'node:http';
import { resolve } from 'node:path';

import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcss from 'postcss';

import stdLibBrowserPlugin from 'node-stdlib-browser/helpers/esbuild/plugin';
import stdLibBrowser from 'node-stdlib-browser';

import copyStaticFiles from 'esbuild-copy-static-files';
import { sassPlugin } from 'esbuild-sass-plugin';
import { type BuildOptions, build, context } from 'esbuild';

// check if watch mode is enabled
const isWatchMode = process.argv.includes('--watch');

// add postcss plugins
const sassTransform = async (source: string): Promise<string> => {
  const { css } = await postcss([autoprefixer, postcssPresetEnv({ stage: 0 })]).process(source, {
    from: source,
  });
  return css;
};

// resolve @ imports in sass
const sassImportMapper = (path: string): string => {
  if (path.includes('node_modules')) return path;
  if (path.includes('@')) return resolve(path.replace(/^.*@\/?/, './src/'));
  return path;
};

const options: BuildOptions = {
  sourceRoot: 'src',
  entryPoints: [
    'src/index.ts',
    'src/index.html',
    'src/styles/global.scss',
    'src/functions/proxy.ts',
  ],
  outdir: 'dist',
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
  plugins: [
    stdLibBrowserPlugin(stdLibBrowser),
    copyStaticFiles({
      src: './node_modules/@time-shift/adapter-jira/dist',
      dest: './dist/@time-shift/adapter-jira',
    }),
    copyStaticFiles({
      src: './node_modules/@time-shift/adapter-mite/dist',
      dest: './dist/@time-shift/adapter-mite',
    }),
    copyStaticFiles({
      src: './src/config.schema.json',
      dest: './dist/config.schema.json',
    }),
    copyStaticFiles({
      src: './src/config.json',
      dest: './dist/config.json',
    }),
    // @ts-ignore https://github.com/glromeo/esbuild-sass-plugin/issues/109#issuecomment-1353194294
    sassPlugin({
      type: 'css-text',
      filter: /\.(component|layout|page)\.scss$/,
      transform: sassTransform,
      importMapper: sassImportMapper,
    }),
    // @ts-ignore https://github.com/glromeo/esbuild-sass-plugin/issues/109#issuecomment-1353194294
    sassPlugin({
      type: 'css',
      transform: sassTransform,
      importMapper: sassImportMapper,
    }),
  ],
};

if (isWatchMode) {
  try {
    const targetPort = 3400;
    const bannerJs = ` if (typeof EventSource !== 'undefined') { new EventSource('/esbuild').addEventListener('change', () => location.reload()) }`;
    const green = (message: string) => `\u001b[32m${message}\u001b[0m`;
    const cyan = (message: string) => `\u001b[36m${message}\u001b[0m`;

    // start dev server in watch mode
    const ctx = await context({ ...options, banner: { js: bannerJs } });
    await ctx.watch();
    const { host: hostname, port } = await ctx.serve({ servedir: 'dist' });

    // use proxy for SPA
    // https://esbuild.github.io/api/#serve-proxy
    createServer((request, response) => {
      const { url, method, headers } = request;
      const path = ~url!.split('/').pop()!.indexOf('.') || url === '/esbuild' ? url : '/index.html';

      request.pipe(
        httpRequest({ hostname, port, path, method, headers }, proxyReponse => {
          response.writeHead(proxyReponse.statusCode!, proxyReponse.headers);
          proxyReponse.pipe(response, { end: true });
        }),
        { end: true },
      );
    }).listen(targetPort);

    // notify user
    console.info(`${green('>')} Server started at ${cyan(`http://${hostname}:${port}`)}`);
    console.info(`${green('>')} Proxy started at ${cyan(`http://${hostname}:${targetPort}`)}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
} else {
  build(options);
}
