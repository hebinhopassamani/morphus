import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MorphusHttpErrorService } from '@core/mpx-http';
import { MorphusMessageService } from '@core/mpx-message';

export const SKIP_GLOBAL_ERROR_MODAL = new HttpContextToken<boolean>(() => false);

const SILENT_AUTH_PATHS = [
  '/api/v1/auth/signin',
  '/api/v1/auth/signup',
  '/api/v1/auth/google',
  '/api/v1/auth/refresh',
];

function getFriendlyErrorTitle(status: number): string {
  switch (status) {
    case 0:
      return 'Servidor indisponível';
    case 400:
    case 501:
      return 'Atenção aos dados informados';
    case 401:
      return 'Sessão expirada';
    case 403:
      return 'Acesso não autorizado';
    case 404:
      return 'Registro não encontrado';
    case 408:
      return 'Tempo limite esgotado';
    case 409:
      return 'Conflito de dados';
    default:
      return 'Ops! Algo deu errado';
  }
}

export const mpxErrorHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MorphusMessageService);
  const httpErrorService = inject(MorphusHttpErrorService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const skipModal =
          req.context.get(SKIP_GLOBAL_ERROR_MODAL) ||
          SILENT_AUTH_PATHS.some((path) => req.url.includes(path));

        if (!skipModal) {
          const serverMessage =
            error.error?.message ||
            error.error?.title ||
            (typeof error.error === 'string' ? error.error : undefined);

          const friendlyDetail = httpErrorService.getFriendlyMessage(
            error.status,
            serverMessage,
          );
          const friendlyTitle = getFriendlyErrorTitle(error.status);

          messageService.showError(friendlyDetail, friendlyTitle, error);
        }

        (error as HttpErrorResponse & { __mpxHandled?: boolean }).__mpxHandled = true;
      }

      return throwError(() => error);
    }),
  );
};
