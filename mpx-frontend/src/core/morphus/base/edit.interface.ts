import { IMpxBaseComponent } from './base.interface';

export interface IMpxEditComponent extends IMpxBaseComponent {
  loadPrimaryKey(): void;
  loadEntity(): Promise<void>;
  submitForm(): Promise<void>;
  create(): Promise<void>;
  update(): Promise<void>;
  back(): void;
  newEntity(): void;
  editEntity(): void;
}
