import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { HTTP_ERROR_CODE } from '@core/mpx-enums';
import { MorphusHttpError } from './morphus-http-error.interface';

@Injectable({
  providedIn: 'root',
})
export class MorphusHttpErrorService {
  public readonly error$ = new Subject<MorphusHttpError>();
  public readonly lastError = signal<MorphusHttpError | null>(null);

  public notifyError(error: MorphusHttpError): void {
    this.lastError.set(error);
    this.error$.next(error);
  }

  public clearError(): void {
    this.lastError.set(null);
  }

  public getFriendlyMessage(status: number, serverMessage?: string): string {
    if (serverMessage && serverMessage.trim().length > 0) {
      return serverMessage;
    }

    switch (status) {
      case HTTP_ERROR_CODE.CONNECTION_REFUSED:
        return 'Não conseguimos conectar ao servidor no momento. Verifique sua conexão e tente novamente.';
      case HTTP_ERROR_CODE.BAD_REQUEST:
        return 'Alguns dados enviados precisam de atenção. Revise os campos e tente novamente.';
      case HTTP_ERROR_CODE.UNAUTHORIZED:
        return 'Sua sessão expirou ou precisa de autenticação para continuar.';
      case HTTP_ERROR_CODE.FORBIDDEN:
        return 'Você ainda não tem permissão para realizar esta ação.';
      case HTTP_ERROR_CODE.NOT_FOUND:
        return 'Não encontramos o registro ou recurso solicitado.';
      case HTTP_ERROR_CODE.CONFLICT:
        return 'Já existe um registro com essas informações.';
      case HTTP_ERROR_CODE.INTERNAL_SERVER_ERROR:
        return 'Ocorreu um imprevisto no servidor. Nossa equipe já foi avisada, tente novamente em instantes.';
      case HTTP_ERROR_CODE.BAD_GATEWAY:
      case HTTP_ERROR_CODE.SERVICE_UNAVAILABLE:
        return 'O serviço está temporariamente indisponível. Tente novamente em alguns segundos.';
      default:
        return 'Ocorreu um erro inesperado ao processar sua solicitação.';
    }
  }
}
