import type { AdapterFields } from '@time-shift/common';

export const strategyFields = {
  strategy: {
    label: 'Strategy',
    description: 'A strategy to map time entries.',
    type: 'string',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Parse notes', value: 'notes' },
    ],
  },
  notesPrefix: {
    label: 'Prefix',
    description: 'A key prefix to search for issue keys in notes.',
    type: 'string',
    when: {
      strategy: 'notes',
    },
  },
  useGeneratedNote: {
    label: 'Use generated note',
    description: 'Use the generated note to lookup issue keys instead of the original notes.',
    type: 'boolean',
    required: false,
    when: {
      strategy: 'notes',
    },
  },
  useFallbackIssue: {
    label: 'Use fallback issue',
    description: 'Use an issue key for time entries that can not be mapped.',
    type: 'boolean',
    required: false,
    when: {
      strategy: 'notes',
    },
  },
  fallbackIssue: {
    label: 'Fallback issue',
    description: 'The issue key to use for time entries that can not be mapped.',
    type: 'string',
    when: {
      useFallbackIssue: true,
    },
  },
} satisfies AdapterFields;

export type JiraAdapterStrategyFields = typeof strategyFields;
