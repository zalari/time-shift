import type { AdapterFields } from '@time-shift/common';

export const strategyFields = {
  strategy: {
    label: 'Strategy',
    description: 'A strategy to map time entries.',
    type: 'string',
    multiple: false,
    options: [{ label: 'None', value: 'none' }],
  },
} satisfies AdapterFields;

export type ClockodoAdapterStrategyFields = typeof strategyFields;
