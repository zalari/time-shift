declare module '*.scss' {
  const content: string;
  export default content;
}

declare module 'lodash-move' {
  const move: <T>(array: T[], moveIndex: number, toIndex: number) => T[];
  const unnecessaryWrapper: { default: typeof move };
  export default unnecessaryWrapper;
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
