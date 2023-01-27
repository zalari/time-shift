import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type ClockodoAdapterConfigFields, config } from './domain/config.fields.js';
import type { ClockodoAdapterQueryFields } from './domain/query.fields.js';
import { adapter } from './adapter.js';

// add types for adapter globally
declare global {
  interface TimeShiftAdapters {
    mite: AdapterSet<ClockodoAdapterConfigFields, ClockodoAdapterQueryFields>;
  }
}

// register the adapter
registerAdapter('clockodo', { adapter, config });
