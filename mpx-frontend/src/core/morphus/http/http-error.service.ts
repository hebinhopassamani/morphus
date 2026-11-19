import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { MpxHttpErrorCode } from '@core/morphus';
import { MpxHttpError } from './http-error.model';

@Injectable({
  providedIn: 'root',
})
export class MpxHttpErrorService {
  public readonly error$ = new Subject<MpxHttpError>();
  public readonly lastError = signal<MpxHttpError | null>(null);

  public notifyError(error: MpxHttpError): void {
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
      case MpxHttpErrorCode.CONNECTION_REFUSED:
        return 'Não conseguimos conectar ao servidor no momento. Verifique sua conexão e tente novamente.';
      case MpxHttpErrorCode.BAD_REQUEST:
        return 'Alguns dados enviados precisam de atenção. Revise os campos e tente novamente.';
      case MpxHttpErrorCode.UNAUTHORIZED:
        return 'Sua sessão expirou ou precisa de autenticação para continuar.';
      case MpxHttpErrorCode.FORBIDDEN:
        return 'Você ainda não tem permissão para realizar esta ação.';
      case MpxHttpErrorCode.NOT_FOUND:
        return 'Não encontramos o registro ou recurso solicitado.';
      case MpxHttpErrorCode.CONFLICT:
        return 'Já existe um registro com essas informações.';
      case MpxHttpErrorCode.INTERNAL_SERVER_ERROR:
        return 'Ocorreu um imprevisto no servidor. Nossa equipe já foi avisada, tente novamente em instantes.';
      case MpxHttpErrorCode.BAD_GATEWAY:
      case MpxHttpErrorCode.SERVICE_UNAVAILABLE:
        return 'O serviço está temporariamente indisponível. Tente novamente em alguns segundos.';
      default:
        return 'Ocorreu um erro inesperado ao processar sua solicitação.';
    }
  }
}
