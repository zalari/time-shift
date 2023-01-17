import type { AdapterConfigValues, AdapterFactory, TimeEntry } from '@time-shift/common';

import type { Worklog } from 'jira.js/out/version3/models';
import { Version3Client } from 'jira.js';

import type { JiraAdapterConfigFields } from './fields/config.fields';
import type { JiraAdapterQueryFields } from './fields/query.fields';

export const createClient = (config: AdapterConfigValues<JiraAdapterConfigFields>): Version3Client => {
  const { apiEmail: email, apiToken, apiUrl } = config;
  return new Version3Client({
    host: new URL(apiUrl, location.href).href,
    authentication: { basic: { email, apiToken } },
    newErrorHandling: true,
  });
};

export const stringifyComments = (comments?: Worklog['comment']): string => {
  return (
    comments?.content
      ?.map(({ content }) => content?.map(({ text = '' }) => text).join(''))
      .join('') ?? ''
  );
};

export const adapter: AdapterFactory<JiraAdapterConfigFields, JiraAdapterQueryFields> = async config => {
  const client = createClient(config);

  return {
    async checkConnection(): Promise<boolean> {
      try {
        const { accountId } = await client.myself.getCurrentUser();
        return accountId !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntries(options): Promise<TimeEntry<Worklog>[]> {
      const { worklogs } = await client.issueWorklogs.getIssueWorklog({ issueIdOrKey: 'MIT-12' });
      return worklogs.map(entry => ({
        at: new Date(entry.started!),
        minutes: entry.timeSpentSeconds! / 60,
        note: stringifyComments(entry.comment),
        active: false,
        payload: entry,
      }));
    },
  };
};
