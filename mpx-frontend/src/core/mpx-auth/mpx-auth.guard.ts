import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MpxAuth } from './mpx.auth';

export const mpxAuthGuard: CanActivateFn = (route, state) => {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    return true;
  }

  const auth = inject(MpxAuth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/security/signin'], {
      queryParams: state.url && state.url !== '/morphus' ? { returnUrl: state.url } : undefined,
    });
  }

  const isOnboardingRoute = state.url.startsWith('/security/onboarding');
  const isSelectCorporationRoute =
    state.url.startsWith('/security/select-corporation') ||
    state.url.startsWith('/website/select-corporation');

  if (auth.needsOnboarding() && !isOnboardingRoute) {
    return router.createUrlTree(['/security/onboarding']);
  }

  if (!auth.needsOnboarding() && isOnboardingRoute) {
    return router.createUrlTree(['/website/home']);
  }

  // Se o usuário ainda precisa selecionar a corporação após login e tenta entrar direto no /morphus:
  if (auth.needsCorporationSelection() && !isSelectCorporationRoute) {
    return router.createUrlTree(['/security/select-corporation'], {
      queryParams: state.url && state.url !== '/morphus' ? { returnUrl: state.url } : undefined,
    });
  }

  // Se a corporação JÁ foi escolhida, a tela select-corporation não aparece mais (a menos que venha com ?switch=true):
  if (isSelectCorporationRoute && auth.corporationSelected() && route.queryParamMap.get('switch') !== 'true') {
    const returnUrl = route.queryParamMap.get('returnUrl') || '/website/home';
    return router.parseUrl(returnUrl);
  }

  return true;
};

export { mpxAuthGuard as authGuard };
