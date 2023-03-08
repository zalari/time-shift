import type { AdapterFactory, TimeEntry } from '@time-shift/common';
import type { EntriesParams } from 'clockodo/dist/clockodo';

import type { ClockodoAdapterConfigFields } from './domain/config.fields';
import { type ClockodoAdapterQueryFields, queryFields } from './domain/query.fields';
import {
  type ClockodoAdapterNoteMappingFields,
  noteMappingFields,
} from './domain/note-mapping.fields';
import { type ClockodoAdapterStrategyFields, strategyFields } from './domain/strategy.fields';

import { NpmClockodoClient } from './infrastructure/npm-clockodo-client';

type ClockodoTimeEntry = {};

export const adapter: AdapterFactory<
  ClockodoAdapterConfigFields,
  ClockodoAdapterQueryFields,
  ClockodoAdapterNoteMappingFields,
  ClockodoAdapterStrategyFields,
  ClockodoTimeEntry
> = async config => {
  return {
    async checkConnection() {
      const client = new NpmClockodoClient(config);
      return client.canConnect();
    },

    async getTimeEntryFields() {
      const client = new NpmClockodoClient(config);
      const customers = await client.getCustomers();
      const projects = await client.getProjects();
      const services = await client.getServices();

      function map() {
        return (value: { name: string }) => ({
          label: value.name,
          value: value.name,
        });
      }

      queryFields.filter.fields.customersName.options = customers.map(map());
      queryFields.filter.fields.projectsName.options = projects.map(map());
      queryFields.filter.fields.servicesName.options = services.map(map());

      return { queryFields, noteMappingFields };
    },

    async getTimeEntries(fields = {}) {
      const client = new NpmClockodoClient(config);
      const params: EntriesParams = {
        timeSince: fields.timeSince!.toISOString(),
        timeUntil: fields.timeUntil!.toISOString(),
        filterBillable: fields.filter?.billable,
        filterProjectsId: fields.filter?.projectsId,
      };

      const entries = await client.getTimeEntries(params);

      return entries.map((entry): TimeEntry => {
        const timeSince = new Date(entry.timeSince);
        const timeUntil = new Date(entry.timeUntil!);

        return {
          id: entry.id,
          minutes: Math.round((timeUntil.getTime() - timeSince.getTime()) / 1000 / 60),
          active: entry.isClockRunning,
          note: entry.text ?? undefined,
          at: timeSince,
        };
      });
    },

    async getStrategyFields() {
      return strategyFields;
    },

    // @TODO: implement preflight
    async getPreflight(sources) {
      const actions = ['create', 'update', 'delete', 'none'] as const;
      return {
        type: '1:1',
        result: sources.map(source => ({
          source,
          target: {
            action: actions[Math.floor(Math.random() * actions.length)],
            entry: source as TimeEntry<ClockodoTimeEntry>,
          },
        })),
      };
    },
  };
};
