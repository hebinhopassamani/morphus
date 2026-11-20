import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MpxSecurity } from './security';

export const MpxSecurityGuard: CanActivateFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const security = inject(MpxSecurity);
  const router = inject(Router);

  if (!security.isAuthenticated()) {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname.toLowerCase();
      if (host === 'morphus.one' || host.endsWith('.morphus.one')) {
        if (host !== 'security.morphus.one') {
          window.location.href = `${window.location.protocol}//security.morphus.one`;
          return false;
        }
        return router.createUrlTree(['/']);
      }
    }
    return router.createUrlTree(['/security'], {
      queryParams: state.url && state.url !== '/morphus' ? { returnUrl: state.url } : undefined,
    });
  }

  const isOnboardingRoute = state.url.startsWith('/security/onboarding');
  const isSelectCorporationRoute =
    state.url.startsWith('/security/select-corporation') || state.url.startsWith('/website/select-corporation');

  if (security.needsOnboarding() && !isOnboardingRoute) {
    return router.createUrlTree(['/security/onboarding']);
  }

  if (!security.needsOnboarding() && isOnboardingRoute) {
    return router.createUrlTree(['/']);
  }

  if (security.needsCorporationSelection() && !isSelectCorporationRoute) {
    return router.createUrlTree(['/security/select-corporation'], {
      queryParams: state.url && state.url !== '/morphus' ? { returnUrl: state.url } : undefined,
    });
  }

  if (isSelectCorporationRoute && security.corporationSelected() && route.queryParamMap.get('switch') !== 'true') {
    const returnUrl = route.queryParamMap.get('returnUrl') || '/';
    return router.parseUrl(returnUrl);
  }

  return true;
};
