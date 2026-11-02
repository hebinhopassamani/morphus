import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MpxAuth } from './mpx.auth';

export const mpxAuthGuard: CanActivateFn = (_route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const auth = inject(MpxAuth);
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

export { mpxAuthGuard as authGuard };
