import type { AdapterFields, AdapterValues } from '@time-shift/common';

export const config = {
  account: {
    type: 'string',
    label: 'Account name',
  },
  apiKey: {
    type: 'string',
    label: 'API key',
  },
} satisfies AdapterFields;

export type MiteAdapterConfigFields = typeof config;
export type MiteAdapterConfigValues = AdapterValues<MiteAdapterConfigFields>;
