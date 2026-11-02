import { Injectable, signal } from '@angular/core';
import { MorphusMessageSeverity } from './message-severity.enum';
import { DefaultMorphusMessage } from './morphus-message.default';
import { IMorphusMessage } from './morphus-message.interface';

@Injectable({
  providedIn: 'root',
})
export class MorphusMessageService {
  public readonly opened = signal<boolean>(false);
  public readonly loading = signal<boolean>(false);
  public readonly showTechnicalError = signal<boolean>(false);
  public readonly message = signal<IMorphusMessage>({ ...DefaultMorphusMessage });

  public showSuccess(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Sucesso',
  ): IMorphusMessage {
    return this.openBySeverity('success', 'circle-check', title, detailOrOptions);
  }

  public showInfo(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Informação',
  ): IMorphusMessage {
    return this.openBySeverity('info', 'info', title, detailOrOptions);
  }

  public showWarn(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Atenção',
  ): IMorphusMessage {
    return this.openBySeverity('warn', 'triangle-alert', title, detailOrOptions);
  }

  public showError(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Erro na operação',
    error?: unknown,
  ): IMorphusMessage {
    const base =
      typeof detailOrOptions === 'string'
        ? { detail: detailOrOptions, title, error }
        : { title, error, ...detailOrOptions };

    return this.show({
      ...base,
      severity: 'error',
      icon: base.icon ?? 'circle-alert',
      confirmButtonText: base.confirmButtonText ?? 'Fechar',
      confirmButtonIcon: base.confirmButtonIcon ?? 'check',
      showCancelButton: base.showCancelButton ?? false,
    });
  }

  public confirm(
    detailOrOptions: string | Partial<IMorphusMessage>,
    onConfirm?: () => void | Promise<void>,
  ): IMorphusMessage {
    const base =
      typeof detailOrOptions === 'string'
        ? { detail: detailOrOptions, onConfirm }
        : { onConfirm: detailOrOptions.onConfirm ?? onConfirm, ...detailOrOptions };

    const severity = base.severity ?? 'warn';
    const defaultIcon = this.getDefaultIcon(severity);

    return this.show({
      title: 'Confirmação',
      confirmButtonText: 'Confirmar',
      confirmButtonIcon: 'check',
      cancelButtonText: 'Cancelar',
      cancelButtonIcon: 'arrow-left',
      disableClose: true,
      ...base,
      severity,
      icon: base.icon ?? defaultIcon,
      isConfirmation: true,
      showCancelButton: true,
    });
  }

  public confirmDelete(
    entityLabel: string,
    onConfirm?: () => void | Promise<void>,
    options?: Partial<IMorphusMessage>,
  ): IMorphusMessage {
    return this.confirm(
      {
        severity: 'error',
        icon: 'trash',
        title: 'Confirma a exclusão?',
        detail: `Tem certeza que deseja excluir "${entityLabel}"? Esta ação não poderá ser desfeita.`,
        confirmButtonText: 'Excluir',
        confirmButtonIcon: 'trash',
        cancelButtonText: 'Cancelar',
        cancelButtonIcon: 'arrow-left',
        ...options,
      },
      onConfirm,
    );
  }

  public show(options: Partial<IMorphusMessage>): IMorphusMessage {
    const severity = options.severity ?? 'info';
    const resolved: IMorphusMessage = {
      ...DefaultMorphusMessage,
      ...options,
      id: options.id ?? crypto.randomUUID(),
      severity,
      icon: options.icon ?? this.getDefaultIcon(severity),
      titleLink: {
        ...DefaultMorphusMessage.titleLink,
        ...options.titleLink,
      },
      detailLink: {
        ...DefaultMorphusMessage.detailLink,
        ...options.detailLink,
      },
      showCancelButton:
        options.showCancelButton ?? Boolean(options.isConfirmation),
    };

    this.loading.set(false);
    this.showTechnicalError.set(false);
    this.message.set(resolved);
    this.opened.set(true);
    return resolved;
  }

  public close(): void {
    this.opened.set(false);
    this.loading.set(false);
    this.showTechnicalError.set(false);
  }

  public toggleTechnicalError(): void {
    this.showTechnicalError.set(!this.showTechnicalError());
  }

  private openBySeverity(
    severity: MorphusMessageSeverity,
    defaultIcon: string,
    defaultTitle: string,
    detailOrOptions: string | Partial<IMorphusMessage>,
  ): IMorphusMessage {
    const base =
      typeof detailOrOptions === 'string'
        ? { title: defaultTitle, detail: detailOrOptions }
        : { title: detailOrOptions.title ?? defaultTitle, ...detailOrOptions };

    return this.show({
      confirmButtonText: 'OK',
      confirmButtonIcon: 'check',
      ...base,
      severity,
      icon: base.icon ?? defaultIcon,
    });
  }

  private getDefaultIcon(severity: MorphusMessageSeverity): string {
    switch (severity) {
      case 'success':
        return 'circle-check';
      case 'warn':
        return 'triangle-alert';
      case 'error':
        return 'circle-alert';
      case 'info':
      default:
        return 'info';
    }
  }
}
