import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ApplicationService } from '@morphus/services/application.service';
import { MorphusContextService } from '@morphus/services/morphus-context.service';

export const nonNativeApplicationEditGuard: CanActivateFn = (route) => {
  const id = route.paramMap.get('id');
  if (!id) {
    return true;
  }

  const router = inject(Router);
  const context = inject(MorphusContextService);
  const applicationService = inject(ApplicationService);

  return applicationService.getById(id).pipe(
    map((app) => {
      if (context.isNativeMorphusApp(app)) {
        const appCode = (app?.prefix || app?.key || '').trim();
        return appCode
          ? router.createUrlTree(['/app', appCode, 'settings'])
          : router.createUrlTree(['/morphus/application']);
      }
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/morphus/application']))),
  );
};

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./application-list/application-list.component').then(
        (m) => m.ApplicationListComponent,
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./application-edit/application-edit.component').then(
        (m) => m.ApplicationEditComponent,
      ),
  },
  {
    path: ':id',
    canActivate: [nonNativeApplicationEditGuard],
    loadComponent: () =>
      import('./application-edit/application-edit.component').then(
        (m) => m.ApplicationEditComponent,
      ),
  },
];

export default routes;
