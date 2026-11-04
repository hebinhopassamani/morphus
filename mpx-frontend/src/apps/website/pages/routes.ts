import { Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadChildren: () => import('@website/pages/home/routes') },
  { path: 'profile', loadChildren: () => import('@website/pages/profile/routes') },
  { path: 'privacidade', loadChildren: () => import('@website/pages/privacy/routes') },
  { path: 'termos', loadChildren: () => import('@website/pages/terms/routes') },
];

export default routes;
