import type { AdapterFields } from '@time-shift/common';

// https://www.clockodo.com/en/api/entries/

export const fields = {
  // common values
  id: {
    label: 'ID',
    description: 'ID of the entry',
    type: 'number',
  },
  customersId: {
    label: 'Customers ID',
    description: 'ID of the corresponding customer',
    type: 'number',
  },
  projectsId: {
    label: 'Projects ID',
    description: 'ID of the corresponding project, or null if none',
    type: 'number',
  },
  usersId: {
    label: 'Users ID',
    description: 'ID of the corresponding co-worker',
    type: 'number',
  },
  billable: {
    label: 'Billable',
    description:
      'Indicates whether the entry is billable (0: not billable, 1: billable, 2: already billed)',
    type: 'number',
    multiple: true,
    options: [
      { label: 'not billable', value: 0 },
      { label: 'billable', value: 1 },
      { label: 'already billed', value: 2 },
    ],
  },
  textsId: {
    label: 'Texts ID',
    description: 'ID of the description text, or null if none',
    type: 'number',
  },
  timeSince: {
    label: 'Starting Time',
    description: 'Starting time of the entry in ISO 8601 UTC format (e.g. "2021-06-30T12:34:56Z")',
    type: 'string',
  },
  timeUntil: {
    label: 'End Time',
    description:
      'End time of the entry in ISO 8601 UTC format (e.g. "2021-06-30T12:34:56Z"), or null if the entry is running',
    type: 'string',
  },
  timeInsert: {
    label: 'Insert Time',
    description: 'Insert time of the entry in ISO 8601 UTC format (e.g. "2021-06-30T12:34:56Z")',
    type: 'string',
  },
  timeLastChange: {
    label: 'Last Change Time',
    description:
      'Time at which the entry has been changed the last time, in ISO 8601 UTC format (e.g. "2021-06-30T12:34:56Z")',
    type: 'string',
  },
  customersName: {
    label: 'Customers Name',
    description:
      'Name of the corresponding customer, only in list function with enhanced list mode enabled',
    type: 'string',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: '' }],
  },
  projectsName: {
    label: 'Projects Name',
    description:
      'Name of the corresponding project, or null if none, only in list function with enhanced list mode enabled',
    type: 'string',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: '' }],
  },
  usersName: {
    label: 'Users Name',
    description:
      'Name of the corresponding co-worker, only in list function with enhanced list mode enabled',
    type: 'string',
  },
  text: {
    label: 'Description Text',
    description:
      'Description text, or null if none, only in list function with enhanced list mode enabled',
    type: 'string',
  },
  revenue: {
    label: 'Revenue',
    description:
      'Only with necessary access rights and only in list function with enhanced list mode enabled',
    type: 'number',
  },

  // type: {
  //   label: 'Type',
  //   description: 'Type of the entry',
  //   type: 'number',
  //   multiple: true,
  //   options: [
  //     { label: 'time entry', value: 1, },
  //     { label: 'lump sum value', value: 2, },
  //     { label: 'entry with lump sum service', value: 3, },
  //   ]
  // }

  // type time entry
  servicesId: {
    label: 'Services ID',
    description: 'ID of the corresponding service',
    type: 'number',
  },
  duration: {
    label: 'Duration',
    description: 'Duration of the entry in seconds',
    type: 'number',
  },
  offset: {
    label: 'Offset',
    description:
      'The time correction of the entry in seconds. Is set if the duration differs from the period between start and end.',
    type: 'number',
  },
  clocked: {
    label: 'Clocked',
    description: 'Entry was stopped with the clock',
    type: 'boolean',
  },
  clockedOffline: {
    label: 'Clocked Offline',
    description: 'Entry was clocked offline',
    type: 'boolean',
  },
  timeClockedSince: {
    label: 'Time clocked since',
    description:
      'Time at which the clock was started in format ISO 8601 UTC, e.g. "2021-06-30T12:34:56Z',
    type: 'string',
  },
  timeLastChangeWorkTime: {
    label: 'Time last change work time',
    description:
      'Time at which worktime relevant details were changed the last timein format ISO 8601 UTC, e.g. "2021-06-30T12:34:56Z"',
    type: 'string',
  },
  hourlyRate: {
    label: 'Hourly rate',
    description: 'Hourly rate. Only with necessary access rights',
    type: 'number',
  },
  servicesName: {
    label: 'Services name',
    description: 'Name of the corr. service. Only in list function with enhanced list mode enabled',
    type: 'string',
    multiple: true,
    // values will be added later, once the connection is configured
    options: [{ label: '', value: '' }],
  },
} satisfies AdapterFields;

export type ClockodoAdapterQueryFields = typeof fields;
