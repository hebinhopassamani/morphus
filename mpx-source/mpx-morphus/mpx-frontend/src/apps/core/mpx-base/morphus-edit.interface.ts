import { IMorphusComponent } from './morphus.interface';

export interface IMorphusEditComponent extends IMorphusComponent {
  loadEntity(): Promise<void>;
  onSave(): Promise<void>;
  onCancel(): void;
}
