import type { AdapterFactory, TimeEntry } from '@time-shift/common';
import type { ClockodoAdapterConfigFields } from './domain/config.fields';
import { type ClockodoAdapterQueryFields, fields } from './domain/query.fields';

import { NpmClockodoClient } from './infrastructure/npm-clockodo-client';
import { EntriesParams } from 'clockodo/dist/clockodo';

export const adapter: AdapterFactory<
  ClockodoAdapterConfigFields,
  ClockodoAdapterQueryFields
> = async config => {
  return {
    async checkConnection(): Promise<boolean> {
      const client = new NpmClockodoClient(config);
      return client.canConnect();
    },

    async getTimeEntryFields(): Promise<ClockodoAdapterQueryFields> {
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

      fields.customersName.options = customers.map(map());
      fields.projectsName.options = projects.map(map());
      fields.servicesName.options = services.map(map());

      return fields;
    },

    async getTimeEntries(fields = {}): Promise<TimeEntry<{}>[]> {
      const client = new NpmClockodoClient(config);
      const params: EntriesParams = {
        timeSince: fields.timeSince!,
        timeUntil: fields.timeUntil!,
        filterBillable: fields.billable,
        filterProjectsId: fields.projectsId,
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
  };
};
