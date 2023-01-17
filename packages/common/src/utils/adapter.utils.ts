import type { AdapterConfigFields, AdapterQueryFields, AdapterSet } from '../types/adapter.types';

// @fixme: provide as global to all adapters
declare global {
  interface Adapters {
    [name: string]: AdapterSet<AdapterConfigFields, AdapterQueryFields>;
  }

  interface TimeShift {
    adapters: Adapters;
    registerAdapter: typeof registerAdapter;
  }

  interface Window {
    'time-shift': TimeShift;
  }
}

export const prepareNamespace = () => {
  if (window['time-shift'] === undefined) {
    window['time-shift'] = { registerAdapter } as TimeShift;
  }
  if (window['time-shift'].adapters === undefined) {
    window['time-shift'].adapters = {};
  }
};

/**
 * Registers an adapter to be globally available.
 */
export const registerAdapter = <C extends AdapterConfigFields, Q extends AdapterQueryFields>(
  name: string,
  adapter: AdapterSet<C, Q>,
) => {
  prepareNamespace();
  window['time-shift'].adapters[name] = adapter as any;
};

export const getAdapter = (name: string): AdapterSet<AdapterConfigFields, AdapterQueryFields> => {
  prepareNamespace();
  return window['time-shift'].adapters[name];
};

export const getAdapters = (): Adapters => {
  prepareNamespace();
  return window['time-shift'].adapters;
};

export const getAdapterNames = (): string[] => {
  return Object.keys(getAdapters());
};
