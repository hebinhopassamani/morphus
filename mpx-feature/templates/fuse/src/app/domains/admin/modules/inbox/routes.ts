import { Routes } from '@angular/router';

const routes: Routes = [
  // Inbox
  {
    path: '',
    loadComponent: () => import('./features/inbox/inbox'),
    children: [
      // Conversation
      {
        path: ':id',
        loadComponent: () => import('./features/inbox/conversation'),
      },
    ],
  },
];

export default routes;
