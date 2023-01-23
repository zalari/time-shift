import type { AdapterFields } from '@time-shift/common';

export const fields = {
  assignee: {
    label: 'Assignee',
    description: 'The assignee to query from.',
    type: 'select',
    multiple: true,
    values: [
      { label: 'Current user', value: 'currentUser()' },
      { label: 'No user', value: 'EMPTY' },
    ],
  },
  worklogAuthor: {
    label: 'Worklog author',
    description: 'The author of the worklog item.',
    type: 'select',
    multiple: true,
    values: [
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
    type: 'select',
    multiple: true,
    values: [
      { label: 'Bug', value: 'Bug' },
      { label: 'Epic', value: 'Epic' },
      { label: 'Story', value: 'Story' },
      { label: 'Task', value: 'Task' },
      { label: 'Issue', value: 'standardIssueTypes()' },
      { label: 'Sub-Task', value: 'subTaskIssueTypes()' },
    ],
  },
} satisfies AdapterFields;

export type JiraAdapterQueryFields = typeof fields;
