import { Injectable, signal } from '@angular/core';
import { MpxIconName } from '@core/morphus';
import {
  MpxToastItem,
  MpxToastOptions,
  MpxToastPosition,
  MpxToastSeverity,
} from './toast.model';

@Injectable({
  providedIn: 'root',
})
export class MpxToastService {
  public readonly toasts = signal<MpxToastItem[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  public show(options: MpxToastOptions): string {
    const id = options.id ?? crypto.randomUUID();
    const severity: MpxToastSeverity = options.severity ?? 'info';
    const position: MpxToastPosition = options.position ?? 'top-right';
    const duration = options.duration ?? 2800;
    const closable = options.closable ?? true;
    const icon = options.icon ?? this.getDefaultIcon(severity);

    const item: MpxToastItem = {
      id,
      title: options.title,
      message: options.message,
      severity,
      position,
      duration,
      icon,
      closable,
      createdAt: Date.now(),
    };

    this.toasts.update((current) => [item, ...current.filter((t) => t.id !== id)].slice(0, 4));

    if (duration > 0) {
      const existing = this.timers.get(id);
      if (existing) {
        clearTimeout(existing);
      }
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  public success(
    message: string,
    options?: Partial<Omit<MpxToastOptions, 'message' | 'severity'>>,
  ): string {
    return this.show({
      ...options,
      message,
      severity: 'success',
    });
  }

  public info(
    message: string,
    options?: Partial<Omit<MpxToastOptions, 'message' | 'severity'>>,
  ): string {
    return this.show({
      ...options,
      message,
      severity: 'info',
    });
  }

  public warn(
    message: string,
    options?: Partial<Omit<MpxToastOptions, 'message' | 'severity'>>,
  ): string {
    return this.show({
      ...options,
      message,
      severity: 'warn',
    });
  }

  public error(
    message: string,
    options?: Partial<Omit<MpxToastOptions, 'message' | 'severity'>>,
  ): string {
    return this.show({
      ...options,
      message,
      severity: 'error',
    });
  }

  public dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  public clearAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.toasts.set([]);
  }

  private getDefaultIcon(severity: MpxToastSeverity): MpxIconName {
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
