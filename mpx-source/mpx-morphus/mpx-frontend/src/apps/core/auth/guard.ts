import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

export const authGuard: CanActivateFn = (_route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/security/signin'], {
      queryParams: state.url && state.url !== '/admin' ? { returnUrl: state.url } : undefined,
    });
  }

  const isOnboardingRoute = state.url.startsWith('/security/onboarding');

  if (auth.needsOnboarding() && !isOnboardingRoute) {
    return router.createUrlTree(['/security/onboarding']);
  }

  if (!auth.needsOnboarding() && isOnboardingRoute) {
    return router.createUrlTree(['/admin']);
  }

  return true;
};
