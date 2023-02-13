import type { AdapterValues, AdapterFactory, TimeEntry } from '@time-shift/common';

import type { Worklog as Worklog2 } from 'jira.js/out/version2/models';
import type { Worklog as Worklog3 } from 'jira.js/out/version3/models';
import { type Config, Version2Client, Version3Client } from 'jira.js';

import type { JiraAdapterConfigFields } from './fields/config.fields';
import { type JiraAdapterQueryFields, queryFields } from './fields/query.fields';
import { type JiraAdapterNoteMappingFields, noteMappingFields } from './fields/note-mapping.fields';
import { type JiraAdapterStrategyFields, strategyFields } from './fields/strategy.fields';

import { findWorklogIssuesByPrefixes, getUnmappedResult } from './utils/preflight.utils';

export type Worklog = Worklog2 | Worklog3;

export const createClient = (config: AdapterValues<JiraAdapterConfigFields>): Version3Client => {
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

export const mapWorklogToTimeEntry = (
  issueKey: string,
  worklog: Worklog,
  noteMappingFields?: Partial<AdapterValues<JiraAdapterNoteMappingFields>>,
): TimeEntry<Worklog> => {
  const { timeSpentSeconds = 0, started = 0, comment } = worklog;
  const note = stringifyComments(comment);
  const entry = { ...worklog, issueKey, note };

  return {
    at: new Date(started),
    minutes: timeSpentSeconds / 60,
    note,
    generated: noteMappingFields?.mapping?.field
      ?.reduce((acc, field) => [...acc, entry[field as keyof Worklog] as string], [] as string[])
      .join('\n'),
    payload: worklog,
  };
};

export const adapter: AdapterFactory<
  JiraAdapterConfigFields,
  JiraAdapterQueryFields,
  JiraAdapterNoteMappingFields,
  JiraAdapterStrategyFields,
  Worklog
> = async config => {
  const client = createClient(config);

  const getWorklogsForIssues = async (
    keys: string[],
    noteMappingFields?: Partial<AdapterValues<JiraAdapterNoteMappingFields>>,
  ): Promise<TimeEntry<Worklog>[]> => {
    return keys.reduce(async (all, issueIdOrKey) => {
      try {
        const { worklogs } = await client.issueWorklogs.getIssueWorklog({ issueIdOrKey });
        const timeEntries = worklogs.map(worklog =>
          mapWorklogToTimeEntry(issueIdOrKey, worklog, noteMappingFields),
        );
        return [...(await all), ...timeEntries];
      } catch (error) {
        return all;
      }
    }, Promise.resolve([] as TimeEntry<Worklog>[]));
  };

  return {
    async checkConnection() {
      try {
        const { active } = await client.myself.getCurrentUser();
        return active !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntryFields() {
      return { queryFields, noteMappingFields };
    },

    /**
     * Gathering time entries requires to resolve all issues first, as jira groups worklog items
     * to issues. Thus, we'll have to query all issues first, then get all worklogs for all issues.
     */
    async getTimeEntries(queryFields = {}, noteMappingFields = {}) {
      // build jql query
      const jql = Object.entries(queryFields?.filter ?? {}).reduce(
        (all, [field, value]) => `${all} AND ${field}=${value}`,
        'timespent>0',
      );

      // get all matching issues
      try {
        const result = await client.issueSearch.searchForIssuesUsingJqlPost({ jql, fields: [] });
        const issues = result.issues ?? [];
        // get all worklogs for all issues
        return getWorklogsForIssues(
          issues.map(({ key }) => key),
          noteMappingFields,
        );
      } catch (error) {
        return [];
      }
    },

    async getStrategyFields() {
      return strategyFields;
    },

    /**
     * Jira worklog items may be grouped to issues, but the worklog items map 1:1 to time entries.
     * Thus, we'll have to map each time entry individually, but return a grouped result.
     *
     * @todo search for existing worklog items by strategy
     * @todo create a result set and match the entries to actions to be made
     * @todo return the results grouped by issue keys
     */
    async getPreflight(sources, fields) {
      switch (fields?.strategy) {
        case 'notes':
          // no prefix, no mapping
          if ([undefined, ''].includes(fields?.notesPrefix)) {
            return getUnmappedResult(sources);
          }

          // group the entries by found issues
          const entries = findWorklogIssuesByPrefixes(sources, [fields!.notesPrefix!]);

          // check for matching jira worklog items
          const keys = Array.from(entries.keys()).filter(key => key !== undefined) as string[];
          const existing = await getWorklogsForIssues(keys);

          // create a result set and deliver it
          console.log(existing);

          const actions = ['create', 'update', 'delete', 'none'] as const;
          return {
            type: '1:n',
            result: sources.map(source => ({
              source,
              targets: [
                {
                  action: actions[Math.floor(Math.random() * actions.length)],
                  entry: source as TimeEntry<Worklog>,
                },
              ],
            })),
          };

        case 'none':
        default:
          return getUnmappedResult(sources);
      }
    },
  };
};
