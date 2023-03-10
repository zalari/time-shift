import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type MiteAdapterConfigFields, configFields } from './fields/config.fields.js';
import type { MiteAdapterQueryFields } from './fields/query.fields.js';
import type { MiteAdapterNoteMappingFields } from './fields/note-mapping.fields.js';
import type { MiteAdapterStrategyFields } from './fields/strategy.fields.js';
import type { Mite } from './types/mite.types.js';
import { adapter } from './adapter.js';

// add types for adapter globally
declare global {
  interface TimeShiftAdapters {
    mite: AdapterSet<
      MiteAdapterConfigFields,
      MiteAdapterQueryFields,
      MiteAdapterNoteMappingFields,
      MiteAdapterStrategyFields,
      Mite.TimeEntry
    >;
  }
}

// register the adapter
registerAdapter('mite', { adapter, config: configFields });
