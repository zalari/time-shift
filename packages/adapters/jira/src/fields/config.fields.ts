import type { AdapterConfigFields, AdapterConfigValues } from '@time-shift/common';

export const config = {
  apiUrl: {
    type: 'url',
    label: 'API url',
    description: 'The API url to either the self hosted Jira instance or the Atlassian cloud.',
  },
  apiEmail: {
    type: 'string',
    label: 'API email',
  },
  apiToken: {
    type: 'string',
    label: 'API token',
  },
} satisfies AdapterConfigFields;

export type JiraAdapterConfigFields = typeof config;
export type JiraAdapterConfigValues = AdapterConfigValues<JiraAdapterConfigFields>;
