import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import {
  BuiDialog,
  BuiDialogBackdrop,
  BuiDialogBody,
  BuiDialogClose,
  BuiDialogContent,
  BuiDialogDescription,
  BuiDialogFooter,
  BuiDialogHeader,
  BuiDialogPortal,
  BuiDialogTitle,
} from '@builder-kit/dialog';
import { MorphusMessageService } from '@core/mpx-message';
import { MorphusMessageSeverity, MorphusMessageType } from '@core/mpx-types';

@Component({
  selector: 'mpx-message',
  exportAs: 'mpxMessage',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
    MatFormField,
    MatInput,
    MatTooltip,
    BuiDialog,
    BuiDialogBackdrop,
    BuiDialogBody,
    BuiDialogClose,
    BuiDialogContent,
    BuiDialogDescription,
    BuiDialogFooter,
    BuiDialogHeader,
    BuiDialogPortal,
    BuiDialogTitle,
  ],
  styleUrl: './message.component.css',
  templateUrl: './message.component.html',
})
export class MpxMessageComponent {
  protected readonly messageService = inject(MorphusMessageService);

  public get messageType(): MorphusMessageType {
    return this.messageService.messageType;
  }

  public set messageType(value: MorphusMessageType) {
    this.messageService.messageType = value;
  }

  protected doubleCheckChecked = false;
  protected doubleCheckInput = '';
  private lastMessageId?: string;

  protected syncIfNewMessage(): boolean {
    const currentId = this.messageService.message().id;
    if (currentId !== this.lastMessageId) {
      this.lastMessageId = currentId;
      this.doubleCheckChecked = false;
      this.doubleCheckInput = '';
    }
    return true;
  }

  protected isPrimaryLike(severity?: MorphusMessageSeverity): boolean {
    return (
      severity === 'primary' ||
      severity === 'secondary' ||
      severity === 'tertiary' ||
      severity === 'surface' ||
      severity === 'help' ||
      severity === 'contrast'
    );
  }

  protected isConfirmDisabled(): boolean {
    this.syncIfNewMessage();

    if (this.messageService.loading()) {
      return true;
    }

    const msg = this.messageService.message();

    if (msg.doubleCheckText) {
      return this.doubleCheckInput.trim().toUpperCase() !== msg.doubleCheckText.trim().toUpperCase();
    }

    if ((msg.doubleCheck || msg.dobbleConfirmation) && !this.doubleCheckChecked) {
      return true;
    }

    return false;
  }

  protected formatTechnicalError(error: unknown): string {
    if (!error) {
      return '';
    }
    if (typeof error === 'string') {
      return error;
    }

    if (typeof error === 'object' && error !== null) {
      const httpErr = error as {
        status?: number;
        error?: { message?: string; detail?: string; title?: string } | string;
        message?: string;
      };

      if (typeof httpErr.error === 'object' && httpErr.error !== null) {
        const apiMessage = httpErr.error.message || httpErr.error.detail || httpErr.error.title;
        if (apiMessage && typeof apiMessage === 'string') {
          return apiMessage;
        }
      } else if (typeof httpErr.error === 'string' && httpErr.error.trim().length > 0) {
        return httpErr.error.trim();
      }

      if (typeof httpErr.status === 'number') {
        switch (httpErr.status) {
          case 0:
            return 'Não foi possível estabelecer conexão com o servidor do Morphus no momento. Verifique se o serviço está ativo ou confira sua conexão com a internet.';
          case 400:
            return 'Alguns dados informados não são válidos ou estão incompletos. Revise os campos preenchidos e tente novamente.';
          case 401:
            return 'Sua sessão expirou por segurança. Faça login novamente para continuar.';
          case 403:
            return 'Seu perfil de acesso atual não possui permissão para realizar esta operação.';
          case 404:
            return 'O registro solicitado não foi encontrado ou já foi removido do sistema.';
          case 409:
            return 'Já existe um registro cadastrado com esses mesmos dados (como nome, documento, e-mail ou chave única).';
          default:
            return 'Ocorreu uma instabilidade temporária ao processar esta solicitação no servidor. Por favor, tente novamente em instantes.';
        }
      }
    }

    return 'Não foi possível concluir a operação no momento. Verifique os dados informados e tente novamente.';
  }

  protected cancelClick(): void {
    const msg = this.messageService.message();
    this.doubleCheckChecked = false;
    this.doubleCheckInput = '';
    msg.onCancel?.();
    this.messageService.close('CLOSE');
  }

  protected async confirmClick(): Promise<void> {
    if (this.isConfirmDisabled()) {
      return;
    }

    const msg = this.messageService.message();
    try {
      this.messageService.loading.set(true);
      await msg.onConfirm?.(msg.data);
      this.doubleCheckChecked = false;
      this.doubleCheckInput = '';
      this.messageService.close('CONFIRM');
    } finally {
      this.messageService.loading.set(false);
    }
  }
}
