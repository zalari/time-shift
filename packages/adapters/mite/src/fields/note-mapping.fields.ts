import type { AdapterFields } from '@time-shift/common';

export const noteMappingFields = {
  field: {
    label: 'Field',
    description: 'A field to map to the generated note',
    type: 'string',
    multiple: true,
    options: [
      { label: 'User', value: 'user_name' },
      { label: 'Customer', value: 'customer_name' },
      { label: 'Project', value: 'project_name' },
      { label: 'Service', value: 'service_name' },
      { label: 'Note', value: 'note' },
    ],
  },
} satisfies AdapterFields;

export type MiteAdapterNoteMappingFields = typeof noteMappingFields;
