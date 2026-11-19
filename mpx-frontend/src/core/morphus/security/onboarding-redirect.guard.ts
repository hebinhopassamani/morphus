import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MpxSecurity } from './security';

export const MpxOnboardingRedirectGuard: CanActivateFn = () => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const security = inject(MpxSecurity);
  const router = inject(Router);

  if (security.isAuthenticated() && security.needsOnboarding()) {
    return router.createUrlTree(['/security/onboarding']);
  }

  return true;
};
