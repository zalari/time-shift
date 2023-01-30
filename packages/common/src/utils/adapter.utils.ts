import type { AdapterSet } from '../types/adapter.types';
import type { AdapterFields } from '../types/field.types';

// @fixme: provide as global to all adapters
declare global {
  interface Adapters {
    [name: string]: AdapterSet<AdapterFields, AdapterFields, AdapterFields, {}>;
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
export const registerAdapter = <
  ConfigFields extends AdapterFields,
  QueryFields extends AdapterFields,
  NoteMappingFields extends AdapterFields,
  TimeEntryPayload extends {},
>(
  name: string,
  adapter: AdapterSet<ConfigFields, QueryFields, NoteMappingFields, TimeEntryPayload>,
) => {
  prepareNamespace();
  window['time-shift'].adapters[name] = adapter as any;
};

export const getAdapter = (
  name: string,
): AdapterSet<AdapterFields, AdapterFields, AdapterFields, {}> => {
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
