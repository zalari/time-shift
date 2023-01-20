import type { AdapterQueryFields } from '@time-shift/common';

export const fields = {
  assignee: {
    label: 'Assignee',
    description: 'The assignee to query from.',
    type: 'string',
    multiple: true,
    values: [
      { label: 'Current user', value: 'currentUser()' },
      { label: 'No user', value: 'EMPTY' },
    ],
  },
  worklogAuthor: {
    label: 'Worklog author',
    description: 'The author of the worklog item.',
    type: 'string',
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
    multiple: true,
    matchers: ['eq'],
  },
  project: {
    label: 'Project',
    description: 'The project to search in.',
    type: 'string',
    matchers: ['eq'],
  },
  issueType: {
    label: 'Issue Type',
    description: 'Limit to specific issue type(s).',
    type: 'string',
    multiple: true,
    matchers: ['eq'],
    values: [
      { label: 'Bug', value: 'Bug' },
      { label: 'Epic', value: 'Epic' },
      { label: 'Story', value: 'Story' },
      { label: 'Task', value: 'Task' },
      { label: 'Issue', value: 'standardIssueTypes()' },
      { label: 'Sub-Task', value: 'subTaskIssueTypes()' },
    ],
  },
} satisfies AdapterQueryFields;

export type JiraAdapterQueryFields = typeof fields;
