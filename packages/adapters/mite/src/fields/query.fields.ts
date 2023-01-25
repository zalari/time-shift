import type { AdapterFields } from '@time-shift/common';

export const fields = {
  at: {
    label: 'At',
    description: 'The time range or date of the time entry',
    type: 'string',
    options: [
      { label: 'today', value: 'today' },
      { label: 'yesterday', value: 'yesterday' },
      { label: 'this week', value: 'this_week' },
      { label: 'last week', value: 'last_week' },
      { label: 'this month', value: 'this_month' },
      { label: 'last month', value: 'last_month' },
      { label: 'this year', value: 'this_year' },
      { label: 'last year', value: 'last_year' },
    ],
  },

  from: {
    label: 'From',
    description: 'All time entries after this date.',
    type: 'date',
  },

  to: {
    label: 'To',
    description: 'All time entries before this date.',
    type: 'date',
  },

  user_id: {
    label: 'Users',
    description:
      'The users to filter for. May be empty if your account user lacks this permission.',
    type: 'number',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: 0 }],
  },

  customer_id: {
    label: 'Customers',
    description: 'The customers to filter for.',
    type: 'number',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: 0 }],
  },

  project_id: {
    label: 'Projects',
    description: 'The projects to filter for.',
    type: 'number',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: 0 }],
  },

  service_id: {
    label: 'Services',
    description: 'The services to filter for.',
    type: 'number',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: 0 }],
  },

  note: {
    label: 'Note',
    description: 'Time entries containing this note.',
    type: 'string',
  },

  billable: {
    label: 'Billable',
    placeholder: 'Whether the time entry is billable.',
    type: 'boolean',
  },

  locked: {
    label: 'Locked',
    placeholder: 'Whether the time entry is locked.',
    type: 'boolean',
  },

  tracking: {
    label: 'Tracking',
    placeholder: 'Whether the time entry is currently tracking.',
    type: 'boolean',
  },
} satisfies AdapterFields;

export type MiteAdapterQueryFields = typeof fields;
