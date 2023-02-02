import type { AdapterFields } from '@time-shift/common';

export const strategyFields = {
  strategy: {
    label: 'Strategy',
    description: 'A strategy to map time entries.',
    type: 'string',
    multiple: false,
    options: [
      { label: 'None', value: 'none' },
      { label: 'Parse notes', value: 'notes' },
    ],
  },
  notesPrefix: {
    label: 'Prefix',
    description: 'A key prefix to search for issue keys in notes.',
    type: 'string',
    multiple: false,
    when: {
      strategy: 'notes',
    },
  },
} satisfies AdapterFields;

export type JiraAdapterStrategyFields = typeof strategyFields;
