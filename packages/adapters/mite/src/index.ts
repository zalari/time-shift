import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type MiteAdapterConfigFields, configFields } from './fields/config.fields.js';
import type { MiteAdapterQueryFields } from './fields/query.fields.js';
import type { MiteAdapterNoteMappingFields } from './fields/note-mapping.fields.js';
import { adapter } from './adapter.js';

// add types for adapter globally
declare global {
  interface TimeShiftAdapters {
    mite: AdapterSet<MiteAdapterConfigFields, MiteAdapterQueryFields, MiteAdapterNoteMappingFields>;
  }
}

// register the adapter
registerAdapter('mite', { adapter, config: configFields });
