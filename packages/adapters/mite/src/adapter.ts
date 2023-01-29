import type {
  AdapterFactory,
  AdapterTimeEntryFieldsResponse,
  AdapterValues,
  TimeEntry,
} from '@time-shift/common';

import type { Mite } from './types/mite.types';
import type { MiteAdapterConfigFields } from './fields/config.fields';
import { type MiteAdapterQueryFields, queryFields } from './fields/query.fields';
import { type MiteAdapterNoteMappingFields, noteMappingFields } from './fields/note-mapping.fields';

import { miteClient } from './utils/mite.utils.js';

export const adapter: AdapterFactory<
  MiteAdapterConfigFields,
  MiteAdapterQueryFields,
  MiteAdapterNoteMappingFields
> = async config => {
  const { account, apiKey } = config;

  return {
    async checkConnection(): Promise<boolean> {
      try {
        const me = await miteClient(account, apiKey).getMyself();
        return me?.id !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntryFields(
      values?: Partial<AdapterValues<MiteAdapterQueryFields>>,
    ): Promise<
      AdapterTimeEntryFieldsResponse<MiteAdapterQueryFields, MiteAdapterNoteMappingFields>
    > {
      const client = miteClient(account, apiKey);
      const users = await client.getUsers();
      const customers = await client.getCustomers();
      const projects = await client.getProjects(values?.customer_id);
      const services = await client.getServices();

      // add options to select fields
      type Optionable = Mite.Commons & Mite.Archivable;
      const getOptions = ({ id, name }: Optionable) => ({ label: name, value: id });

      queryFields.user_id.options = users.map(getOptions);
      queryFields.customer_id.options = customers.map(getOptions);
      queryFields.project_id.options = projects.map(getOptions);
      queryFields.service_id.options = services.map(getOptions);

      return { queryFields, noteMappingFields };
    },

    async getTimeEntries(fields = {}): Promise<TimeEntry<Mite.TimeEntry>[]> {
      // prepare options from fields
      const options = Object.entries(fields).reduce(
        (a, [key, value]) => ({ ...a, [key]: (a as any)[key] ? [(a as any)[key], value] : value }),
        {} satisfies Mite.TimeEntryOptions,
      );
      const entries = await miteClient(account, apiKey).getTimeEntries(options);
      return entries.map(
        ({ time_entry: entry }) =>
          ({
            at: new Date(entry.date_at),
            minutes: entry.minutes,
            active: entry.tracking ? true : false,
            note: entry.note,
            payload: entry,
          } satisfies TimeEntry<Mite.TimeEntry>),
      );
    },
  };
};
