declare module 'node-stdlib-browser/helpers/esbuild/plugin' {
  import type StdLibBrowser from 'node-stdlib-browser';
  import type { Plugin } from 'esbuild';
  export default function (lib: typeof StdLibBrowser): Plugin;
}
