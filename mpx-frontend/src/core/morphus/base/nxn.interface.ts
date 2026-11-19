import { IMpxBaseComponent } from './base.interface';

export interface IMpxNxnComponent extends IMpxBaseComponent {
  loadItems(): Promise<void>;
}
