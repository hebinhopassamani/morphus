import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
  IconName,
  MorphusMessageSeverity,
  MorphusMessageType,
  ResultType,
  Severity,
} from '@core/mpx-types';
import { DefaultMorphusMessage } from './morphus-message.default';
import { IMorphusMessage } from './morphus-message.interface';
import { IMorphusMessageRef } from './morphus-message-ref.interface';
import { IMorphusModalResult } from './morphus-modal-result.interface';

@Injectable({
  providedIn: 'root',
})
export class MorphusMessageService {
  public readonly opened = signal<boolean>(false);
  public readonly loading = signal<boolean>(false);
  public readonly showTechnicalError = signal<boolean>(false);
  public readonly message = signal<IMorphusMessage>({ ...DefaultMorphusMessage });
  public messageType: MorphusMessageType = 'NORMAL';

  private afterClosedSubject?: Subject<IMorphusModalResult<unknown>>;
  private autoCloseTimer?: ReturnType<typeof setTimeout>;

  public showSuccess(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Sucesso',
  ): IMorphusMessageRef {
    return this.openBySeverity('success', 'circle-check', title, detailOrOptions);
  }

  public showInfo(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Informação',
  ): IMorphusMessageRef {
    return this.openBySeverity('info', 'info', title, detailOrOptions);
  }

  public showWarn(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Aviso',
  ): IMorphusMessageRef {
    return this.openBySeverity('warn', 'triangle-alert', title, detailOrOptions);
  }

  public showAlert(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Alerta',
  ): IMorphusMessageRef {
    return this.openBySeverity('alert', 'octagon-alert', title, detailOrOptions);
  }

  public showNeutral(
    title: string,
    detailOrOptions: string | Partial<IMorphusMessage>,
  ): IMorphusMessageRef {
    return this.openBySeverity('primary', 'info', title, detailOrOptions);
  }

  public showPrimary(
    title: string,
    detailOrOptions: string | Partial<IMorphusMessage>,
  ): IMorphusMessageRef {
    return this.openBySeverity('primary', 'info', title, detailOrOptions);
  }

  public showError(
    detailOrOptions: string | Partial<IMorphusMessage>,
    title = 'Ops, algo saiu errado',
    error?: unknown,
  ): IMorphusMessageRef {
    const base =
      typeof detailOrOptions === 'string'
        ? { detail: detailOrOptions, title, error }
        : { title, error, ...detailOrOptions };

    return this.show({
      ...base,
      severity: 'error',
      icon: base.icon ?? 'circle-alert',
      confirmButtonText: base.confirmButtonText ?? base.confirmText ?? 'Fechar',
      confirmButtonIcon: base.confirmButtonIcon ?? base.confirmIcon ?? 'check',
      showCancelButton: base.showCancelButton ?? false,
    });
  }

  public showMessage(
    title: string,
    message: string,
    severity: Severity = 'info',
    config?: Partial<IMorphusMessage>,
  ): IMorphusMessageRef {
    return this.show({
      ...config,
      title,
      detail: message,
      message,
      severity,
      icon: config?.icon ?? this.getDefaultIcon(severity),
    });
  }

  public getConfirmation<T = unknown>(
    entity: T,
    title: string,
    message: string,
    severity: Severity = 'alert',
    config?: Partial<IMorphusMessage<T>>,
  ): IMorphusMessageRef<T> {
    return this.confirm<T>({
      severity,
      title,
      detail: message,
      message,
      data: entity,
      doubleCheck: config?.doubleCheck ?? config?.dobbleConfirmation ?? true,
      doubleCheckLabel:
        config?.doubleCheckLabel ??
        config?.dobbleConfirmationMessage ??
        'Estou ciente que não haverá como reverter esta ação!',
      icon: config?.icon ?? 'trash',
      closeSeverity: config?.closeSeverity ?? 'warn',
      cancelButtonText: config?.cancelButtonText ?? config?.closeText ?? 'Cancelar',
      cancelButtonIcon: config?.cancelButtonIcon ?? config?.closeIcon ?? 'arrow-left',
      confirmSeverity: config?.confirmSeverity ?? severity,
      confirmButtonText: config?.confirmButtonText ?? config?.confirmText ?? 'Excluir',
      confirmButtonIcon: config?.confirmButtonIcon ?? config?.confirmIcon ?? 'trash',
      disableClose: true,
      ...config,
    });
  }

  public confirm<T = unknown>(
    detailOrOptions: string | Partial<IMorphusMessage<T>>,
    onConfirm?: (data?: T) => void | Promise<void>,
  ): IMorphusMessageRef<T> {
    const base: Partial<IMorphusMessage<T>> =
      typeof detailOrOptions === 'string'
        ? { detail: detailOrOptions, onConfirm }
        : { onConfirm: detailOrOptions.onConfirm ?? onConfirm, ...detailOrOptions };

    const severity = base.severity ?? 'warn';
    const defaultIcon = this.getDefaultIcon(severity);

    return this.show<T>({
      title: 'Confirmação',
      confirmButtonText: base.confirmButtonText ?? base.confirmText ?? 'Confirmar',
      confirmButtonIcon: base.confirmButtonIcon ?? base.confirmIcon ?? 'check',
      cancelButtonText: base.cancelButtonText ?? base.closeText ?? 'Cancelar',
      cancelButtonIcon: base.cancelButtonIcon ?? base.closeIcon ?? 'arrow-left',
      disableClose: true,
      ...base,
      severity,
      icon: base.icon ?? defaultIcon,
      isConfirmation: true,
      showCancelButton: true,
    });
  }

  public confirmDelete<T = unknown>(
    entityLabel: string,
    onConfirm?: (data?: T) => void | Promise<void>,
    options?: Partial<IMorphusMessage<T>>,
  ): IMorphusMessageRef<T> {
    return this.confirm<T>(
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

  public show<T = unknown>(options: Partial<IMorphusMessage<T>>): IMorphusMessageRef<T> {
    const currentMessageType = this.messageType;
    // Toda vez que tentar exibir uma mensagem, seja ela qual for, volta o status deste atributo para 'NORMAL'
    this.messageType = 'NORMAL';

    const titleText = (options.title ?? '').trim().toLowerCase();
    const detailText = options.detail ?? options.message ?? '';
    const detailLower = detailText.trim().toLowerCase();
    const isSessionExpiredMessage =
      titleText.includes('sessão expirada') ||
      titleText.includes('sessao expirada') ||
      detailLower.includes('sua sessão expirou') ||
      detailLower.includes('sua sessao expirou');

    const isExplicitSessionExpired =
      currentMessageType === 'SESSION_EXPIRED' ||
      currentMessageType === 'expired_session' ||
      currentMessageType === 'expired';

    if (isSessionExpiredMessage && !isExplicitSessionExpired) {
      const noopSubject = new Subject<IMorphusModalResult<T>>();
      noopSubject.complete();
      return {
        message: { ...(DefaultMorphusMessage as IMorphusMessage<T>), ...options },
        afterClosed: () => noopSubject.asObservable(),
        close: () => undefined,
      };
    }

    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }

    if (this.afterClosedSubject && !this.afterClosedSubject.closed) {
      this.afterClosedSubject.complete();
    }

    const subject = new Subject<IMorphusModalResult<T>>();
    this.afterClosedSubject = subject as Subject<IMorphusModalResult<unknown>>;

    const severity = options.severity ?? 'info';
    const doubleCheck = options.doubleCheck ?? options.dobbleConfirmation ?? false;
    const doubleCheckLabel =
      options.doubleCheckLabel ??
      options.dobbleConfirmationMessage ??
      DefaultMorphusMessage.doubleCheckLabel;

    const resolved: IMorphusMessage<T> = {
      ...(DefaultMorphusMessage as IMorphusMessage<T>),
      ...options,
      id: options.id ?? crypto.randomUUID(),
      severity,
      detail: detailText,
      message: detailText,
      doubleCheck,
      dobbleConfirmation: doubleCheck,
      doubleCheckLabel,
      dobbleConfirmationMessage: doubleCheckLabel,
      confirmButtonText:
        options.confirmButtonText ??
        options.confirmText ??
        DefaultMorphusMessage.confirmButtonText,
      confirmButtonIcon:
        options.confirmButtonIcon ??
        options.confirmIcon ??
        DefaultMorphusMessage.confirmButtonIcon,
      cancelButtonText:
        options.cancelButtonText ??
        options.closeText ??
        DefaultMorphusMessage.cancelButtonText,
      cancelButtonIcon:
        options.cancelButtonIcon ??
        options.closeIcon ??
        DefaultMorphusMessage.cancelButtonIcon,
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
        options.showCancelButton ??
        options.closeButton ??
        Boolean(options.isConfirmation),
    };

    this.loading.set(false);
    this.showTechnicalError.set(false);
    this.message.set(resolved as IMorphusMessage);
    this.opened.set(true);

    if (resolved.timeout && resolved.timeout > 0) {
      this.autoCloseTimer = setTimeout(() => {
        this.close('CLOSE');
      }, resolved.timeout);
    }

    return {
      message: resolved,
      afterClosed: () => subject.asObservable(),
      close: (resultType: ResultType = 'CLOSE') => this.close(resultType),
    };
  }

  public close(resultType: ResultType = 'CLOSE'): void {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = undefined;
    }

    const currentMsg = this.message();
    this.opened.set(false);
    this.loading.set(false);
    this.showTechnicalError.set(false);

    if (this.afterClosedSubject && !this.afterClosedSubject.closed) {
      this.afterClosedSubject.next({
        resultType,
        data: resultType === 'CONFIRM' ? currentMsg.data : undefined,
      });
      this.afterClosedSubject.complete();
    }
  }

  public toggleTechnicalError(): void {
    this.showTechnicalError.set(!this.showTechnicalError());
  }

  private openBySeverity(
    severity: MorphusMessageSeverity,
    defaultIcon: IconName,
    defaultTitle: string,
    detailOrOptions: string | Partial<IMorphusMessage>,
  ): IMorphusMessageRef {
    const base =
      typeof detailOrOptions === 'string'
        ? { title: defaultTitle, detail: detailOrOptions }
        : { title: detailOrOptions.title ?? defaultTitle, ...detailOrOptions };

    return this.show({
      confirmButtonText: 'Fechar',
      confirmButtonIcon: 'check',
      ...base,
      severity,
      icon: base.icon ?? defaultIcon,
    });
  }

  private getDefaultIcon(severity: MorphusMessageSeverity): IconName {
    switch (severity) {
      case 'success':
        return 'circle-check';
      case 'warn':
        return 'triangle-alert';
      case 'alert':
        return 'octagon-alert';
      case 'error':
        return 'circle-alert';
      case 'primary':
      case 'secondary':
      case 'tertiary':
      case 'surface':
      case 'info':
      default:
        return 'info';
    }
  }
}
