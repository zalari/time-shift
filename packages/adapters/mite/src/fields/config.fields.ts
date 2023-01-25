import type { AdapterField, AdapterFields, AdapterValues } from '@time-shift/common';

export const config = {
  account: {
    type: 'string',
    label: 'Account name',
  } satisfies AdapterField<'string'>,

  apiKey: {
    type: 'token',
    label: 'API key',
  } satisfies AdapterField<'token'>,
} satisfies AdapterFields;

export type MiteAdapterConfigFields = typeof config;
export type MiteAdapterConfigValues = AdapterValues<MiteAdapterConfigFields>;
