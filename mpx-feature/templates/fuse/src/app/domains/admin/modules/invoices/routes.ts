import { Routes } from '@angular/router';

const routes: Routes = [
  // Invoices
  {
    path: '',
    loadComponent: () => import('./features/invoices/invoices'),
  },

  // Invoice
  {
    path: ':id',
    loadComponent: () => import('./features/invoice/invoice'),
  },
];

export default routes;
