import type { AdapterFields, AdapterValues } from '@time-shift/common';

export const config = {
  apiKey: {
    type: 'token',
    label: 'API key',
  },

  application: {
    type: 'string',
    label: 'Name of application or company',
  },

  applicationEmail: {
    type: 'string',
    label: 'Email of technical contact person for application or company',
  },

  user: {
    type: 'string',
    label: 'User email address',
  },
} satisfies AdapterFields;

export type ClockodoAdapterConfigFields = typeof config;
export type ClockodoAdapterConfigValues = AdapterValues<ClockodoAdapterConfigFields>;
