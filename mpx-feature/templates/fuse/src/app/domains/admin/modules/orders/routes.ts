import { Routes } from '@angular/router';

const routes: Routes = [
  // Orders
  {
    path: '',
    loadComponent: () => import('./features/orders/orders'),
  },

  // Order
  {
    path: ':id',
    loadComponent: () => import('./features/order/order'),
  },
];

export default routes;
