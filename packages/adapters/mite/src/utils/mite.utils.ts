import type {
  MiteDate,
  MiteGroupedTimeEntry,
  MiteMyself,
  MiteTimeEntryOptions,
  MiteUngroupedTimeEntry,
} from '../types/mite.types';

const API_URL = 'https://corsapi.mite.yo.lk';

export const doRequest = (account: string, apiKey: string, url: URL) =>
  fetch(url, {
    headers: {
      'X-MiteAccount': account,
      'X-MiteApiKey': apiKey,
    },
  });

export const normalizeDateOption = (date: MiteDate): string => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

export const getMyself =
  (account: string, apiKey: string, path: string) => async (): Promise<MiteMyself> => {
    const url = new URL(path, API_URL);
    const reponse = await doRequest(account, apiKey, url);
    const entry = await reponse.json();
    return {
      ...entry.user,
      created_at: new Date(entry.user.created_at),
      updated_at: new Date(entry.user.updated_at),
    };
  };

export const getTimeEntries =
  (account: string, apiKey: string, path: string) =>
  async (
    options: MiteTimeEntryOptions = {},
  ): Promise<
    Array<
      typeof options extends { group_by: string } ? MiteGroupedTimeEntry : MiteUngroupedTimeEntry
    >
  > => {
    const { at, from, to, group_by, ...others } = options;
    const params = others as Record<string, string>;
    if (at !== undefined) params.at = normalizeDateOption(at);
    if (from !== undefined) params.from = normalizeDateOption(from);
    if (to !== undefined) params.to = normalizeDateOption(to);
    if (group_by !== undefined) params.group_by = group_by.join(',');

    const url = new URL(path, API_URL);
    url.search = `${new URLSearchParams(params)}`;

    const reponse = await doRequest(account, apiKey, url);
    const entries = await reponse.json();
    // normalize data if needed
    return entries;
  };

export const miteClient = (account: string, apiKey: string) => ({
  getMyself: getMyself(account, apiKey, 'myself.json'),
  getTimeEntries: getTimeEntries(account, apiKey, 'time_entries.json'),
});
