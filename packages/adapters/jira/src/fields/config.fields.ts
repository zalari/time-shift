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
  apiAuth: {
    type: 'select',
    label: 'Authorization method',
    description:
      'Whether to use a personal access token, or an username (email) and password (api token) pair.',
    values: ['Bearer', 'Basic'],
  },
  apiEmail: {
    type: 'string',
    label: 'Email address',
    when: { apiAuth: 'Basic' },
  },
  apiToken: {
    type: 'string',
    label: 'API token',
    when: { apiAuth: 'Basic' },
  },
  apiPersonalAccessToken: {
    type: 'string',
    label: 'Personal access token',
    when: { apiAuth: 'Bearer' },
  },
} satisfies AdapterConfigFields;

export type JiraAdapterConfigFields = typeof config;
export type JiraAdapterConfigValues = AdapterConfigValues<JiraAdapterConfigFields>;
