import type { AdapterConfigFields, AdapterConfigValues } from '@time-shift/common';

export const config = {
  account: {
    type: 'string',
    label: 'Account name',
  },
  apiKey: {
    type: 'string',
    label: 'API key',
  },
} satisfies AdapterConfigFields;

export type MiteAdapterConfigFields = typeof config;
export type MiteAdapterConfigValues = AdapterConfigValues<MiteAdapterConfigFields>;
