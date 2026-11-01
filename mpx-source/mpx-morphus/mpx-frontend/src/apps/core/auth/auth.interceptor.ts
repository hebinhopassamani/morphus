import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '@/environments/environment';
import { MORPHUS_SESSION_STORAGE_KEY } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    const sessionRaw = localStorage.getItem(MORPHUS_SESSION_STORAGE_KEY);

    if (sessionRaw) {
      try {
        const session = JSON.parse(sessionRaw);
        const token: string | undefined = session?.accessToken?.value;
        const corporationId: string | undefined = session?.corporation?.id;

        const isApiUrl = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api/');

        if (token && isApiUrl) {
          const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
          };

          if (corporationId) {
            headers['X-Corporation-Id'] = corporationId;
          }

          req = req.clone({ setHeaders: headers });
        }
      } catch (e) {
        console.error('Falha ao processar a sessão JWT no Interceptor:', e);
      }
    }
  }

  return next(req);
};
