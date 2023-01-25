import type { AdapterField, AdapterFields, AdapterValues } from '@time-shift/common';

export const config = {
  apiVersion: {
    type: 'string',
    label: 'API version',
    description:
      'The version of the API to use. For Jira Cloud version 3 can be used. Most self hosted Jira instances provide version 2.',
    options: [
      { label: 'Version 2', value: '2' },
      { label: 'Version 3', value: '3' },
    ],
  } satisfies AdapterField<'string'>,
  apiUrl: {
    type: 'url',
    label: 'API url',
    description: 'The API url to either the self hosted Jira instance or the Atlassian cloud.',
  } satisfies AdapterField<'url'>,
  apiAuth: {
    type: 'string',
    label: 'Authorization method',
    description:
      'Whether to use a personal access token, or an username (email) and password (api token) pair.',
    options: [
      { label: 'Personal access token', value: 'bearer' },
      { label: 'Username / password', value: 'basic' },
    ],
  } satisfies AdapterField<'string'>,
  apiEmail: {
    type: 'email',
    label: 'Email address',
    when: { apiAuth: 'basic' },
  } satisfies AdapterField<'email'>,
  apiToken: {
    type: 'token',
    label: 'API token',
    when: { apiAuth: 'basic' },
  } satisfies AdapterField<'token'>,
  apiPersonalAccessToken: {
    type: 'token',
    label: 'Personal access token',
    when: { apiAuth: 'bearer' },
  } satisfies AdapterField<'token'>,
} satisfies AdapterFields;

export type JiraAdapterConfigFields = typeof config;
export type JiraAdapterConfigValues = AdapterValues<JiraAdapterConfigFields>;
