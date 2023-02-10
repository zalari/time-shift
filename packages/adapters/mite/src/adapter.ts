import type { AdapterFactory, TimeEntry } from '@time-shift/common';

import type { Mite } from './types/mite.types';
import type { MiteAdapterConfigFields } from './fields/config.fields';
import { type MiteAdapterQueryFields, queryFields } from './fields/query.fields';
import { type MiteAdapterNoteMappingFields, noteMappingFields } from './fields/note-mapping.fields';
import { type MiteAdapterStrategyFields, strategyFields } from './fields/strategy.fields';

import { miteClient } from './utils/mite.utils.js';

export const adapter: AdapterFactory<
  MiteAdapterConfigFields,
  MiteAdapterQueryFields,
  MiteAdapterNoteMappingFields,
  MiteAdapterStrategyFields,
  Mite.TimeEntry
> = async config => {
  const { account, apiKey } = config;

  return {
    async checkConnection() {
      try {
        const me = await miteClient(account, apiKey).getMyself();
        return me?.id !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntryFields(values) {
      const client = miteClient(account, apiKey);
      const users = await client.getUsers();
      const customers = await client.getCustomers();
      const projects = await client.getProjects(values?.filter?.customer_id);
      const services = await client.getServices();

      // add options to select fields
      type Optionable = Mite.Commons & Mite.Archivable;
      const getOptions = ({ id, name }: Optionable) => ({ label: name, value: id });

      queryFields.filter.fields.user_id.options = users.map(getOptions);
      queryFields.filter.fields.customer_id.options = customers.map(getOptions);
      queryFields.filter.fields.project_id.options = projects.map(getOptions);
      queryFields.filter.fields.service_id.options = services.map(getOptions);

      return { queryFields, noteMappingFields };
    },

    async getTimeEntries(queryFields = {}, noteMappingFields = {}) {
      // prepare options from fields
      const options = Object.entries(queryFields.filter ?? {}).reduce(
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
            generated: noteMappingFields.mapping?.field
              ?.reduce((acc, field) => [...acc, entry[field as keyof typeof entry]], [] as string[])
              .join('\n'),
            payload: entry,
          } satisfies TimeEntry<Mite.TimeEntry>),
      );
    },

    async getStrategyFields() {
      return strategyFields;
    },

    // @TODO: implement preflight
    async getPreflight(sources, _strategyFields) {
      const actions = ['create', 'update', 'delete', 'none'] as const;
      return {
        type: '1:1',
        result: sources.map(source => ({
          source,
          target: {
            action: actions[Math.floor(Math.random() * actions.length)],
            entry: source as TimeEntry<Mite.TimeEntry>,
          },
        })),
      };
    },
  };
};
