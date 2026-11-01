import { Routes } from '@angular/router';

const routes: Routes = [
  // Tickets
  {
    path: '',
    loadComponent: () => import('./features/tickets/tickets'),
    children: [
      // Ticket
      {
        path: ':id',
        loadComponent: () => import('./features/tickets/ticket'),
      },
    ],
  },
];

export default routes;
