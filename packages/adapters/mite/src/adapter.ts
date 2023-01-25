import type { AdapterFactory, TimeEntry } from '@time-shift/common';

import type { MiteTimeEntry, MiteTimeEntryOptions } from './types/mite.types';
import type { MiteAdapterConfigFields } from './fields/config.fields';
import type { MiteAdapterQueryFields } from './fields/query.fields';

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
        return me.id !== undefined;
      } catch (error) {
        return false;
      }
    },

    async getTimeEntries(fields = {}): Promise<TimeEntry<MiteTimeEntry>[]> {
      // prepare options from fields
      const options = Object.entries(fields).reduce(
        (all, [key, value]) => ({ ...all, [key]: value }),
        {} satisfies MiteTimeEntryOptions,
      );
      const entries = await miteClient(account, apiKey).getTimeEntries(options);
      return entries.map(({ time_entry: entry }) => ({
        id: `${entry.id}`,
        at: new Date(entry.date_at),
        minutes: entry.minutes,
        active: entry.tracking ? true : false,
        note: entry.note,
        payload: entry,
      }));
    },
  };
};
