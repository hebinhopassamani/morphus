import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('@security/pages/dashboard/routes') },
  { path: 'user', loadChildren: () => import('@security/pages/user/routes') },
  { path: 'role', loadChildren: () => import('@security/pages/role/routes') },
  { path: 'claim', loadChildren: () => import('@security/pages/claim/routes') },
  { path: 'module', loadChildren: () => import('@security/pages/module/routes') },
  { path: 'user-role', redirectTo: 'user', pathMatch: 'full' },
];

export default routes;
