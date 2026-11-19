import { MpxIconName } from '@core/morphus';

export type MpxToastSeverity = 'info' | 'warn' | 'success' | 'error';

export type MpxToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface MpxToastOptions {
  id?: string;
  title?: string;
  message: string;
  severity?: MpxToastSeverity;
  position?: MpxToastPosition;
  duration?: number;
  icon?: MpxIconName;
  closable?: boolean;
}

export interface MpxToastItem extends Required<Omit<MpxToastOptions, 'title'>> {
  title?: string;
  createdAt: number;
}
