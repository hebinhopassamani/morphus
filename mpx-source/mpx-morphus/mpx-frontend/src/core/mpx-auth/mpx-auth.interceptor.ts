import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '@/environments/environment';
import { HTTP_ERROR_CODE, MorphusHttpErrorService } from '@core/mpx-http';
import { MORPHUS_SESSION_STORAGE_KEY } from './mpx.auth';

export const mpxAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const errorService = inject(MorphusHttpErrorService);

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

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const serverMessage =
          err.error?.message ||
          err.error?.title ||
          (typeof err.error === 'string' ? err.error : undefined);

        const details: string[] | undefined = Array.isArray(err.error?.errors)
          ? err.error.errors
          : undefined;

        errorService.notifyError({
          status: err.status,
          code: (err.status as HTTP_ERROR_CODE) ?? HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR,
          message: errorService.getFriendlyMessage(err.status, serverMessage),
          details,
          url: req.url,
          timestamp: new Date(),
        });
      }
      return throwError(() => err);
    }),
  );
};

export { mpxAuthInterceptor as authInterceptor };
