import type { AdapterConfigValues, AdapterFactory, TimeEntry } from '@time-shift/common';

import type {
  Issue as Issue2,
  PageOfWorklogs as PageOfWorklogs2,
  SearchResults as SearchResults2,
  User as User2,
  Worklog as Worklog2,
} from 'jira.js/out/version2/models';
import type {
  Issue as Issue3,
  PageOfWorklogs as PageOfWorklogs3,
  SearchResults as SearchResults3,
  User as User3,
  Worklog as Worklog3,
} from 'jira.js/out/version3/models';
import { Version2Client, Version3Client } from 'jira.js';

import type { JiraAdapterConfigFields } from './fields/config.fields';
import type { JiraAdapterQueryFields } from './fields/query.fields';

export type Issue = Issue2 | Issue3;
export type PageOfWorklogs = PageOfWorklogs2 | PageOfWorklogs3;
export type SearchResults = SearchResults2 | SearchResults3;
export type User = User2 | User3;
export type Worklog = Worklog2 | Worklog3;

export const createClient = (
  config: AdapterConfigValues<JiraAdapterConfigFields>,
): Version3Client => {
  const clients = { '2': Version2Client, '3': Version3Client };
  const { apiEmail: email, apiToken, apiUrl, apiVersion = '3' } = config;
  return new clients[apiVersion as '2' | '3']({
    host: new URL(apiUrl, location.href).href,
    authentication: { basic: { email, apiToken } },
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
        const { accountId } = await client.myself.getCurrentUser<User>();
        return accountId !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntries(options = {}): Promise<TimeEntry<Worklog>[]> {
      const { assignee, issueType, key, project } = options;
      const fields: string[] = [];

      // build jql query
      if (assignee !== undefined) fields.push(`assignee=${assignee.value}`);
      if (issueType !== undefined) fields.push(`issuetype=${issueType.value}`);
      if (key !== undefined) fields.push(`key=${key.value}`);
      if (project !== undefined) fields.push(`project=${project.value}`);

      // get all matching issues
      const result = await client.issueSearch.searchForIssuesUsingJqlPost<SearchResults>({
        jql: fields.join(' AND '),
        fields: ['id'],
      });
      const issues = result.issues ?? ([] as Issue[]);

      // get all worklogs for all issues
      return issues.reduce(async (all, { key: issueIdOrKey }) => {
        const { worklogs } = await client.issueWorklogs.getIssueWorklog<PageOfWorklogs>({
          issueIdOrKey,
        });
        const timeEntries = worklogs.map(worklog => mapWorklogToTimeEntry(issueIdOrKey, worklog));
        return [...(await all), ...timeEntries];
      }, Promise.resolve([] as TimeEntry<Worklog>[]));
    },
  };
};
