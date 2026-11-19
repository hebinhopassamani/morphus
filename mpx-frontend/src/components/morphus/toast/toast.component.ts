import { Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MpxToastItem,
  MpxToastPosition,
  MpxToastService,
} from '@core/morphus';

@Component({
  selector: 'mpx-toast',
  imports: [MatIcon],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class MpxToastComponent {
  protected readonly toastService = inject(MpxToastService);

  protected readonly positions: MpxToastPosition[] = [
    'top-right',
    'top-left',
    'top-center',
    'bottom-right',
    'bottom-left',
    'bottom-center',
  ];

  protected readonly toastsByPosition = computed(() => {
    const all = this.toastService.toasts();
    const map = new Map<MpxToastPosition, MpxToastItem[]>();
    for (const pos of this.positions) {
      map.set(
        pos,
        all.filter((t) => t.position === pos),
      );
    }
    return map;
  });

  protected getToasts(pos: MpxToastPosition): MpxToastItem[] {
    return this.toastsByPosition().get(pos) ?? [];
  }

  protected getPositionClasses(pos: MpxToastPosition): string {
    switch (pos) {
      case 'top-left':
        return 'top-5 left-6 items-start';
      case 'top-center':
        return 'top-5 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-right':
        return 'bottom-5 right-6 items-end';
      case 'bottom-left':
        return 'bottom-5 left-6 items-start';
      case 'bottom-center':
        return 'bottom-5 left-1/2 -translate-x-1/2 items-center';
      case 'top-right':
      default:
        return 'top-5 right-6 items-end';
    }
  }
}
