import type { AdapterFields, AdapterValues } from '@time-shift/common';

export const config = {
  apiVersion: {
    type: 'select',
    label: 'API version',
    description:
      'The version of the API to use. For Jira Cloud version 3 can be used. Most self hosted Jira instances provide version 2.',
    multiple: false,
    values: [
      { label: 'Version 2', value: '2' },
      { label: 'Version 3', value: '3' },
    ],
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
    multiple: false,
    values: [
      { label: 'Personal access token', value: 'bearer' },
      { label: 'Username / password', value: 'basic' },
    ],
  },
  apiEmail: {
    type: 'string',
    label: 'Email address',
    when: { apiAuth: 'basic' },
  },
  apiToken: {
    type: 'string',
    label: 'API token',
    when: { apiAuth: 'basic' },
  },
  apiPersonalAccessToken: {
    type: 'string',
    label: 'Personal access token',
    when: { apiAuth: 'bearer' },
  },
} satisfies AdapterFields;

export type JiraAdapterConfigFields = typeof config;
export type JiraAdapterConfigValues = AdapterValues<JiraAdapterConfigFields>;
