import type { AdapterFields } from '@time-shift/common';

export const queryFields = {
  filter: {
    label: 'Filter',
    type: 'group',
    fields: {
      assignee: {
        label: 'Assignee',
        description: 'The assignee to query from.',
        type: 'string',
        multiple: true,
        options: [
          { label: 'Current user', value: 'currentUser()' },
          { label: 'No user', value: 'EMPTY' },
        ],
      },

      worklogAuthor: {
        label: 'Worklog author',
        description: 'The author of the worklog item.',
        type: 'string',
        multiple: true,
        options: [
          { label: 'Current user', value: 'currentUser()' },
          { label: 'No user', value: 'EMPTY' },
        ],
      },

      key: {
        label: 'Key',
        description: 'The issue key to read worklog items from.',
        type: 'string',
      },

      project: {
        label: 'Project',
        description: 'The project to search in.',
        type: 'string',
      },

      issueType: {
        label: 'Issue Type',
        description: 'Limit to specific issue type(s).',
        type: 'string',
        multiple: true,
        options: [
          { label: 'Bug', value: 'Bug' },
          { label: 'Epic', value: 'Epic' },
          { label: 'Story', value: 'Story' },
          { label: 'Task', value: 'Task' },
          { label: 'Issue', value: 'standardIssueTypes()' },
          { label: 'Sub-Task', value: 'subTaskIssueTypes()' },
        ],
      },
    },
  },
} satisfies AdapterFields;

export type JiraAdapterQueryFields = typeof queryFields;
