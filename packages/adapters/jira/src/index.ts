import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type JiraAdapterConfigFields, config } from './fields/config.fields.js';
import type { JiraAdapterQueryFields } from './fields/query.fields.js';
import { adapter } from './adapter.js';

declare global {
  interface TimeShiftAdapters {
    jira: AdapterSet<JiraAdapterConfigFields, JiraAdapterQueryFields>;
  }
}

registerAdapter('jira', { adapter, config });
