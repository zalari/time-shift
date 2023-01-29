import {
  AdapterFieldType,
  AdapterFieldTypeMap,
  AdapterFields,
  AdapterValues,
} from '@time-shift/common';
import type { Mite } from '../types/mite.types';

const API_URL = 'https://corsapi.mite.yo.lk';

export const forceArray = <T>(v: T | T[]) => (Array.isArray(v) ? v : [v]);

export const setDateOption =
  <O extends Record<string, any>>(options: O, params: URLSearchParams) =>
  (k: string) =>
    k in options && params.set(k as string, normalizeDateOption((options as any)[k]));

export const setArrayOption =
  <O extends Record<string, any>>(options: O, params: URLSearchParams) =>
  (k: string) =>
    k in options && params.set(k as string, forceArray((options as any)[k]).join(','));

export const setMultipleOptions =
  <O extends Record<string, any>>(options: O, params: URLSearchParams) =>
  (k: string) =>
    k in options &&
    forceArray((options as any)[k]).forEach((v: any) => params.set(`${k as string}[]`, v));

export const doRequest = (account: string, apiKey: string, url: URL) =>
  fetch(url, {
    headers: {
      'X-MiteAccount': account,
      'X-MiteApiKey': apiKey,
    },
  });

export const normalizeDateOption = (date: NonNullable<Mite.TimeEntryOptions['at']>): string => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

export const normalizeCommons = <T extends Mite.Commons>(entry: T): T => ({
  ...entry,
  created_at: new Date(entry.created_at),
  updated_at: new Date(entry.updated_at),
});

export const getMyself =
  (account: string, apiKey: string, path: string) => async (): Promise<Mite.Myself | undefined> => {
    const url = new URL(path, API_URL);
    const response = await doRequest(account, apiKey, url);
    const entry = response.ok ? await response.json() : undefined;
    return normalizeCommons(entry.user);
  };

export const getUsers =
  (account: string, apiKey: string, path: string) => async (): Promise<Mite.User[]> => {
    const url = new URL(path, API_URL);
    const response = await doRequest(account, apiKey, url);
    const users = response.ok
      ? ((await response.json()) as Mite.WrappedEntry<'user', Mite.User>[])
      : [];
    // normalize common data
    return users.map(({ user }) => normalizeCommons(user));
  };

export const getCustomers =
  (account: string, apiKey: string, path: string) => async (): Promise<Mite.Customer[]> => {
    const url = new URL(path, API_URL);
    const response = await doRequest(account, apiKey, url);
    const customers = response.ok
      ? ((await response.json()) as Mite.WrappedEntry<'customer', Mite.Customer>[])
      : [];

    // normalize common data
    return customers.map(({ customer }) => normalizeCommons(customer));
  };

export const getProjects =
  (account: string, apiKey: string, path: string) =>
  async (customer_id?: number | number[]): Promise<Mite.Project[]> => {
    const url = new URL(path, API_URL);
    if (customer_id !== undefined) {
      url.searchParams.set('customer_id', forceArray(customer_id).join(','));
    }
    const response = await doRequest(account, apiKey, url);
    const projects = response.ok
      ? ((await response.json()) as Mite.WrappedEntry<'project', Mite.Project>[])
      : [];
    // normalize common data
    return projects.map(({ project }) => normalizeCommons(project));
  };

export const getServices =
  (account: string, apiKey: string, path: string) => async (): Promise<Mite.Service[]> => {
    const url = new URL(path, API_URL);
    const response = await doRequest(account, apiKey, url);
    const services = response.ok
      ? ((await response.json()) as Mite.WrappedEntry<'service', Mite.Service>[])
      : [];
    // normalize common data
    return services.map(({ service }) => normalizeCommons(service));
  };

export const getTimeEntries =
  (account: string, apiKey: string, path: string) =>
  async (
    options: Mite.TimeEntryOptions = {},
  ): Promise<
    Array<
      typeof options extends { group_by: string } ? Mite.GroupedTimeEntry : Mite.UngroupedTimeEntry
    >
  > => {
    // prepare params from non-array types
    const { group_by, user_id, customer_id, project_id, service_id, note, ...others } = options;
    const params = new URLSearchParams(others as Record<string, string>);

    // apply values according to API docs
    // https://mite.yo.lk/en/api/time-entries.html#list-all
    ['at', 'from', 'to'].forEach(setDateOption(options, params));
    ['group_by', 'user_id', 'customer_id', 'project_id', 'service_id'].forEach(
      setArrayOption(options, params),
    );
    ['note'].forEach(setMultipleOptions(options, params));

    // build request url with params
    const url = new URL(path, API_URL);
    url.search = `${params}`;

    // fetch response
    const response = await doRequest(account, apiKey, url);
    const entries = response.ok ? await response.json() : [];

    // normalize common data
    return entries.map((entry: Mite.TimeEntry) => normalizeCommons(entry));
  };

export const miteClient = (account: string, apiKey: string) => ({
  getCustomers: getCustomers(account, apiKey, 'customers.json'),
  getMyself: getMyself(account, apiKey, 'myself.json'),
  getProjects: getProjects(account, apiKey, 'projects.json'),
  getServices: getServices(account, apiKey, 'services.json'),
  getTimeEntries: getTimeEntries(account, apiKey, 'time_entries.json'),
  getUsers: getUsers(account, apiKey, 'users.json'),
});
