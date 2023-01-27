import type { AdapterFactory, TimeEntry } from '@time-shift/common';

import type { Mite } from './types/mite.types';
import type { MiteAdapterConfigFields } from './fields/config.fields';
import { type MiteAdapterQueryFields, fields } from './fields/query.fields';

import { miteClient } from './utils/mite.utils.js';

export const adapter: AdapterFactory<
  MiteAdapterConfigFields,
  MiteAdapterQueryFields
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

    async getTimeEntryFields(): Promise<MiteAdapterQueryFields> {
      const client = miteClient(account, apiKey);
      const users = await client.getUsers();
      const customers = await client.getCustomers();
      const projects = await client.getProjects();
      const services = await client.getServices();

      // add options to select fields
      type Optionable = Mite.Commons & Mite.Archivable;
      const getOptions = ({ id, name }: Optionable) => ({ label: name, value: id });

      fields.user_id.options = users.map(getOptions);
      fields.customer_id.options = customers.map(getOptions);
      fields.project_id.options = projects.map(getOptions);
      fields.service_id.options = services.map(getOptions);

      return fields;
    },

    async getTimeEntries(fields = {}): Promise<TimeEntry<Mite.TimeEntry>[]> {
      // prepare options from fields
      const options = Object.entries(fields).reduce(
        (all, [key, value]) => ({ ...all, [key]: value }),
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
