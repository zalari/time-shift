import { type AdapterSet, registerAdapter } from '@time-shift/common';

import { type MiteAdapterConfigFields, config } from './fields/config.fields.js';
import { type MiteAdapterQueryFields, fields } from './fields/query.fields.js';
import { adapter } from './adapter.js';

// add types for adapter globally
declare global {
  interface TimeShiftAdapters {
    mite: AdapterSet<MiteAdapterConfigFields, MiteAdapterQueryFields>;
  }
}

// register the adapter
registerAdapter('mite', { adapter, config, fields });
