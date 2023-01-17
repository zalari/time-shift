declare module '*.scss' {
  const content: string;
  export default content;
}

declare module 'node-stdlib-browser/helpers/esbuild/plugin' {
  import type StdLibBrowser from 'node-stdlib-browser';
  import type { Plugin } from 'esbuild';
  export default function (lib: typeof StdLibBrowser): Plugin;
}

declare module 'esbuild-copy-static-files' {
  import type { Plugin } from 'esbuild';
  export type CopyStaticFilesOptions = {
    src: string;
    dest: string;
    filter: (src: string, dest: string) => boolean;

    dereference: boolean;
    errorOnExist: boolean;
    force: boolean;
    preserveTimestamps: boolean;
    recursive: boolean;
  };
  const copyStaticFiles: (options?: Partial<CopyStaticFilesOptions>) => Plugin;
  export default copyStaticFiles;
}
