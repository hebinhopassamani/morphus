import { IsActiveMatchOptions } from '@angular/router';

export type NavigationItem = {
  id: string;
  label: string;
  section?: boolean;
  icon?: string;
  badge?: string;
  route?: string;
  routeActiveOptions?: { exact: boolean } | IsActiveMatchOptions;
  disabled?: boolean;
  expanded?: boolean;
  children?: NavigationItem[];
};

export const NAVIGATION: NavigationItem[] = [
  {
    id: 'home.overview',
    label: 'Overview',
    route: '/dashboards/project',
    icon: 'layout-dashboard',
  },
  {
    id: 'home.analytics',
    label: 'Analytics',
    route: '/dashboards/analytics',
    icon: 'chart-line',
  },
  {
    id: 'workspace',
    label: 'Workspace',
    section: true,
    children: [
      {
        id: 'workspace.projects',
        label: 'Projects',
        route: '/projects',
        icon: 'folder-kanban',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'workspace.calendar',
        label: 'Calendar',
        route: '/calendar',
        icon: 'calendar',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'workspace.tasks',
        label: 'Tasks',
        route: '/tasks',
        icon: 'list-todo',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'workspace.files',
        label: 'Files',
        route: '/files',
        icon: 'folder',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'workspace.notes',
        label: 'Notes',
        route: '/notes',
        icon: 'sticky-note',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'workspace.teams',
        label: 'Teams',
        route: '/teams',
        icon: 'users-round',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'workspace.members',
        label: 'Members',
        route: '/members',
        icon: 'user-round',
        routeActiveOptions: { exact: false },
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    section: true,
    children: [
      {
        id: 'sales.orders',
        label: 'Orders',
        route: '/orders',
        icon: 'shopping-cart',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'sales.customers',
        label: 'Customers',
        route: '/customers',
        icon: 'users',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'sales.invoices',
        label: 'Invoices',
        route: '/invoices',
        icon: 'receipt-text',
        routeActiveOptions: { exact: false },
      },
    ],
  },
  {
    id: 'mail',
    label: 'Mail',
    section: true,
    children: [
      {
        id: 'mail.inbox',
        label: 'Inbox',
        route: '/inbox',
        icon: 'inbox',
        routeActiveOptions: { exact: false },
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    section: true,
    children: [
      {
        id: 'account.settings',
        label: 'Settings',
        route: '/settings',
        icon: 'settings',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'account.integrations',
        label: 'Integrations',
        route: '/integrations',
        icon: 'plug',
      },
      {
        id: 'account.imports',
        label: 'Imports',
        route: '/imports',
        icon: 'file-up',
        routeActiveOptions: { exact: false },
      },
      {
        id: 'account.audit-logs',
        label: 'Audit logs',
        route: '/audit-logs',
        icon: 'scroll-text',
      },
      {
        id: 'account.notifications',
        label: 'Notifications',
        route: '/notifications',
        icon: 'bell',
      },
    ],
  },
];
