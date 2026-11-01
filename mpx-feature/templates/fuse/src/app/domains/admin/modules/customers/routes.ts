import { Routes } from '@angular/router';

const routes: Routes = [
  // Customers
  {
    path: '',
    loadComponent: () => import('./features/customers/customers'),
  },

  // Customer
  {
    path: ':id',
    loadComponent: () => import('./features/customer/customer'),
  },
];

export default routes;
