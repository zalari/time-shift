import type { AdapterQueryFields } from '@time-shift/common';

export const fields = {
  at: {
    label: 'At',
    description: 'The time range or date of the time entry',
    type: 'date',
    multiple: false,
    values: [
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
    description: 'All time entries after this date',
    type: 'date',
    matchers: ['eq'],
  },
  to: {
    label: 'To',
    description: 'All time entries before this date',
    type: 'date',
    matchers: ['eq'],
  },
  user_id: {
    label: 'User ID',
    description: 'The ID of the user',
    type: 'number',
    matchers: ['eq'],
  },
  customer_id: {
    label: 'Customer ID',
    description: 'The ID of the customer',
    type: 'number',
    matchers: ['eq'],
  },
  project_id: {
    label: 'Project ID',
    description: 'The ID of the project',
    type: 'number',
    matchers: ['eq'],
  },
  service_id: {
    label: 'Service ID',
    description: 'The ID of the service',
    type: 'number',
    matchers: ['eq'],
  },
  note: {
    label: 'Note',
    description: 'Time entries containing this note',
    type: 'string',
    matchers: ['in'],
  },
  billable: {
    label: 'Billable',
    placeholder: 'Whether the time entry is billable',
    type: 'boolean',
    matchers: ['eq'],
  },
  locked: {
    label: 'Locked',
    placeholder: 'Whether the time entry is locked',
    type: 'boolean',
    matchers: ['eq'],
  },
  tracking: {
    label: 'Tracking',
    placeholder: 'Whether the time entry is currently tracking',
    type: 'boolean',
    matchers: ['eq'],
  },
} satisfies AdapterQueryFields;

export type MiteAdapterQueryFields = typeof fields;
