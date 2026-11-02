import { IMorphusComponent } from './morphus.interface';

export interface IMorphusNxNComponent extends IMorphusComponent {
  loadItems(): Promise<void>;
}
