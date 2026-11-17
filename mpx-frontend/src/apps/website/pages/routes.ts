import { Routes } from '@angular/router';
import { onboardingRedirectGuard } from '@core/mpx-auth';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    canActivate: [onboardingRedirectGuard],
    loadChildren: () => import('@website/pages/home/routes'),
  },
  { path: 'produtos', loadChildren: () => import('@website/pages/products/routes') },
  { path: 'products', redirectTo: 'produtos', pathMatch: 'full' },
  { path: 'contato', loadChildren: () => import('@website/pages/contact/routes') },
  { path: 'contact', redirectTo: 'contato', pathMatch: 'full' },
  {
    path: 'profile',
    canActivate: [onboardingRedirectGuard],
    loadChildren: () => import('@website/pages/profile/routes'),
  },
  { path: 'privacidade', loadChildren: () => import('@website/pages/privacy/routes') },
  { path: 'termos', loadChildren: () => import('@website/pages/terms/routes') },
];

export default routes;
