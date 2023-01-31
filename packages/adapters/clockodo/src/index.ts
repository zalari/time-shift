import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type ClockodoAdapterConfigFields, configFields } from './domain/config.fields.js';
import type { ClockodoAdapterQueryFields } from './domain/query.fields.js';
import type { ClockodoAdapterNoteMappingFields } from './domain/note-mapping.fields.js';
import type { ClockodoAdapterStrategyFields } from './domain/strategy.fields.js';
import type { ClockodoTimeEntry } from './domain/Clockodo/clockodo-time-entry.js';

import { adapter } from './adapter.js';

// add types for adapter globally
declare global {
  interface TimeShiftAdapters {
    mite: AdapterSet<
      ClockodoAdapterConfigFields,
      ClockodoAdapterQueryFields,
      ClockodoAdapterNoteMappingFields,
      ClockodoAdapterStrategyFields,
      ClockodoTimeEntry
    >;
  }
}

// register the adapter
registerAdapter('clockodo', { adapter, config: configFields });
