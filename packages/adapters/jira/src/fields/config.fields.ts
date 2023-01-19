import type { AdapterConfigFields, AdapterConfigValues } from '@time-shift/common';

export const config = {
  apiVersion: {
    type: 'select',
    label: 'API version',
    description:
      'The version of the API to use. For Jira Cloud version 3 can be used. Most self hosted Jira instances provide version 2.',
    values: ['2', '3'],
  },
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
