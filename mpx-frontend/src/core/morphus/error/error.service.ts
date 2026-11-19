import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';
import { MpxMessageService } from '@core/morphus';

@Injectable({
  providedIn: 'root',
})
export class MpxErrorHandlerService implements ErrorHandler {
  private readonly messageService = inject(MpxMessageService);

  handleError(error: unknown): void {
    const unwrapped = this.unwrapError(error);

    if (this.isAlreadyHandledHttpError(unwrapped)) {
      return;
    }

    console.error('[MpxErrorHandler]', unwrapped);

    if (unwrapped instanceof Error) {
      this.messageService.showError(
        unwrapped.message || 'Ocorreu algo inesperado na sua solicitação.',
        'Ops! Algo deu errado',
        unwrapped,
      );
      return;
    }

    this.messageService.showError(
      'Ocorreu um erro inesperado na sua solicitação.',
      'Ops! Algo deu errado',
      unwrapped,
    );
  }

  private unwrapError(error: unknown): unknown {
    if (error && typeof error === 'object' && 'rejection' in error) {
      return (error as { rejection: unknown }).rejection;
    }
    return error;
  }

  private isAlreadyHandledHttpError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) {
      return true;
    }
    if (error && typeof error === 'object' && '__mpxHandled' in error) {
      return Boolean((error as { __mpxHandled?: boolean }).__mpxHandled);
    }
    return false;
  }
}
