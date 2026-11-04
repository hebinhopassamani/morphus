import { IconName } from '@core/mpx-types';

export type MorphusToastSeverity = 'info' | 'warn' | 'success' | 'error';

export type MorphusToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center';

export interface IMorphusToastOptions {
  id?: string;
  title?: string;
  message: string;
  severity?: MorphusToastSeverity;
  position?: MorphusToastPosition;
  duration?: number;
  icon?: IconName;
  closable?: boolean;
}

export interface IMorphusToastItem extends Required<Omit<IMorphusToastOptions, 'title'>> {
  title?: string;
  createdAt: number;
}
