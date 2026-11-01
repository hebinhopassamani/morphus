import { Routes } from '@angular/router';
import { AdminLayout } from '@/app/domains/admin/layout/layout';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboards',
      },

      // Dashboards
      {
        path: 'dashboards',
        loadChildren: () => import('./modules/dashboards/routes'),
      },

      // Projects
      {
        path: 'projects',
        loadChildren: () => import('./modules/projects/routes'),
      },

      // Calendar
      {
        path: 'calendar',
        loadChildren: () => import('./modules/calendar/routes'),
      },

      // Tasks
      {
        path: 'tasks',
        loadChildren: () => import('./modules/tasks/routes'),
      },

      // Files
      {
        path: 'files',
        loadChildren: () => import('./modules/files/routes'),
      },

      // Notes
      {
        path: 'notes',
        loadChildren: () => import('./modules/notes/routes'),
      },

      // Teams
      {
        path: 'teams',
        loadChildren: () => import('./modules/teams/routes'),
      },

      // Members
      {
        path: 'members',
        loadChildren: () => import('./modules/members/routes'),
      },

      // Orders
      {
        path: 'orders',
        loadChildren: () => import('./modules/orders/routes'),
      },

      // Customers
      {
        path: 'customers',
        loadChildren: () => import('./modules/customers/routes'),
      },

      // Invoices
      {
        path: 'invoices',
        loadChildren: () => import('./modules/invoices/routes'),
      },

      // Inbox
      {
        path: 'inbox',
        loadChildren: () => import('./modules/inbox/routes'),
      },

      // Audit logs
      {
        path: 'audit-logs',
        loadChildren: () => import('./modules/audit-logs/routes'),
      },

      // Notifications
      {
        path: 'notifications',
        loadChildren: () => import('./modules/notifications/routes'),
      },

      // Settings
      {
        path: 'settings',
        loadChildren: () => import('./modules/settings/routes'),
      },

      // Integrations
      {
        path: 'integrations',
        loadChildren: () => import('./modules/integrations/routes'),
      },

      // Imports
      {
        path: 'imports',
        loadChildren: () => import('./modules/imports/routes'),
      },
    ],
  },
];

export default routes;
