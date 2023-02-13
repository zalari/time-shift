import type { AdapterFields } from '@time-shift/common';

export const noteMappingFields = {
  mapping: {
    label: 'Note mapping',
    type: 'group',
    fields: {
      field: {
        label: 'Field',
        description: 'A field to map to the generated note.',
        type: 'string',
        multiple: true,
        options: [
          { label: 'Issue', value: 'issueKey' },
          { label: 'Note', value: 'note' },
        ],
      },
    },
  },
} satisfies AdapterFields;

export type JiraAdapterNoteMappingFields = typeof noteMappingFields;
