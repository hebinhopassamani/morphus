import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@security/pages/dashboard/dashboard.routes').then((m) => m.routes),
  },
  {
    path: 'user',
    loadChildren: () => import('@security/pages/user/user.routes').then((m) => m.routes),
  },
  {
    path: 'role',
    loadChildren: () => import('@security/pages/role/role.routes').then((m) => m.routes),
  },
  {
    path: 'claim',
    loadChildren: () => import('@security/pages/claim/claim.routes').then((m) => m.routes),
  },
  {
    path: 'module',
    loadChildren: () => import('@security/pages/module/module.routes').then((m) => m.routes),
  },
  { path: 'user-role', redirectTo: 'user', pathMatch: 'full' },
];
