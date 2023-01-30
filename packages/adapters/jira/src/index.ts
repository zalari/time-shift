import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type JiraAdapterConfigFields, configFields } from './fields/config.fields.js';
import type { JiraAdapterQueryFields } from './fields/query.fields.js';
import type { JiraAdapterNoteMappingFields } from './fields/note-mapping.fields.js';
import { type Worklog, adapter } from './adapter.js';

declare global {
  interface TimeShiftAdapters {
    jira: AdapterSet<
      JiraAdapterConfigFields,
      JiraAdapterQueryFields,
      JiraAdapterNoteMappingFields,
      Worklog
    >;
  }
}

registerAdapter('jira', { adapter, config: configFields });
