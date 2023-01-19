import type { AdapterQueryFields } from '@time-shift/common';

export const fields = {
  assignee: {
    label: 'Assignee',
    description: 'The assignee to query from.',
    type: 'string',
    multiple: true,
    values: ['currentUser()', 'EMPTY'],
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
    values: ['Bug', 'Epic', 'Story', 'Task', 'standardIssueTypes()', 'subTaskIssueTypes()'],
  },
} satisfies AdapterQueryFields;

export type JiraAdapterQueryFields = typeof fields;
