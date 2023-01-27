import type { AdapterFields, AdapterValues } from '@time-shift/common';

export const configFields = {
  account: {
    type: 'string',
    label: 'Account name',
  },

  apiKey: {
    type: 'token',
    label: 'API key',
  },
} satisfies AdapterFields;

export type MiteAdapterConfigFields = typeof configFields;
export type MiteAdapterConfigValues = AdapterValues<MiteAdapterConfigFields>;
