import type { Route } from '@vaadin/router';
import { getAllQuerys } from '../data/query.data';

export const ROOT_ROUTES = [
  {
    path: '/',
    redirect: '/time-entries',
  },
  {
    path: '/time-entries',
    async action(_, commands) {
      const queries = await getAllQuerys();
      if (queries.length === 0) {
        return commands.redirect('/settings/query/new');
      } else {
        const [{ id }] = queries.sort((a, b) => a.name.localeCompare(b.name));
        return commands.redirect(`/time-entries/${id}`);
      }
    },
  },
  {
    path: '/time-entries/:id',
    component: 'time-shift-time-entries-page',
  },
  {
    path: '/settings',
    component: 'time-shift-settings-page',
    children: [
      {
        path: 'connection',
        redirect: '/settings',
      },
      {
        path: 'connection/new/:prefill?',
        component: 'time-shift-connection-new-page',
      },
      {
        path: 'connection/:id',
        component: 'time-shift-connection-edit-page',
      },
      {
        path: 'query',
        redirect: '/settings',
      },
      {
        path: 'query/new/:prefill?',
        component: 'time-shift-query-new-page',
      },
      {
        path: 'query/:id',
        component: 'time-shift-query-edit-page',
      },
    ],
  },
  {
    path: '/test-form',
    component: 'time-shift-test-form-page',
  },
  {
    path: '(.*)',
    component: 'time-shift-not-found-page',
  },
] satisfies Route[];
