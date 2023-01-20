import type { AdapterConfigValues, AdapterFactory, TimeEntry } from '@time-shift/common';

import type { Worklog as Worklog2 } from 'jira.js/out/version2/models';
import type { Worklog as Worklog3 } from 'jira.js/out/version3/models';
import { type Config, Version2Client, Version3Client } from 'jira.js';

import type { JiraAdapterConfigFields } from './fields/config.fields';
import type { JiraAdapterQueryFields } from './fields/query.fields';

type Worklog = Worklog2 | Worklog3;

export const createClient = (
  config: AdapterConfigValues<JiraAdapterConfigFields>,
): Version3Client => {
  const clients = { '2': Version2Client, '3': Version3Client };
  const { apiAuth, apiUrl, apiVersion = '3' } = config;
  const authentication = {} as Config['authentication'];
  if (apiAuth === 'basic') {
    const { apiEmail: email, apiToken } = config;
    authentication!.basic = { email, apiToken };
  }
  if (apiAuth === 'bearer') {
    const { apiPersonalAccessToken } = config;
    authentication!.personalAccessToken = apiPersonalAccessToken;
  }
  return new clients[apiVersion as '2' | '3']({
    host: new URL(apiUrl, location.href).href,
    authentication,
    noCheckAtlassianToken: true,
    newErrorHandling: true,
  }) as Version3Client;
};

export const stringifyComments = (comments?: (Worklog2 | Worklog3)['comment']): string => {
  if (typeof comments === 'string') return comments;
  return (
    comments?.content
      ?.map(({ content }) => content?.map(({ text = '' }) => text).join(''))
      .join('') ?? ''
  );
};

export const mapWorklogToTimeEntry = (issueKey: string, worklog: Worklog): TimeEntry<Worklog> => {
  const { timeSpentSeconds = 0, started = 0, comment } = worklog;
  return {
    at: new Date(started),
    minutes: timeSpentSeconds / 60,
    note: `${issueKey}\n${stringifyComments(comment)}`,
    payload: worklog,
  };
};

export const adapter: AdapterFactory<
  JiraAdapterConfigFields,
  JiraAdapterQueryFields
> = async config => {
  const client = createClient(config);

  return {
    async checkConnection(): Promise<boolean> {
      try {
        const { active } = await client.myself.getCurrentUser();
        return active !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntries(options = {}): Promise<TimeEntry<Worklog>[]> {
      // build jql query
      const jql = Object.keys(options).reduce(
        (all, field) => `${all} AND ${field}=${options[field as keyof typeof options]?.value}`,
        'timespent>0',
      );

      // get all matching issues
      const result = await client.issueSearch.searchForIssuesUsingJqlPost({ jql, fields: [] });
      const issues = result.issues ?? [];

      // get all worklogs for all issues
      return issues.reduce(async (all, { key: issueIdOrKey }) => {
        const { worklogs } = await client.issueWorklogs.getIssueWorklog({ issueIdOrKey });
        const timeEntries = worklogs.map(worklog => mapWorklogToTimeEntry(issueIdOrKey, worklog));
        return [...(await all), ...timeEntries];
      }, Promise.resolve([] as TimeEntry<Worklog>[]));
    },
  };
};
