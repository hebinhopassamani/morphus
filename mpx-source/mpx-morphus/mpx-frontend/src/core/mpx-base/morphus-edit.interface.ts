import { IMorphusComponent } from './morphus.interface';

export interface IMorphusEditComponent extends IMorphusComponent {
  loadPrimaryKey(): void;
  loadEntity(): Promise<void>;
  submitForm(): Promise<void>;
  create(): Promise<void>;
  update(): Promise<void>;
  back(): void;
  newEntity(): void;
  editEntity(): void;
}

export type IMorphusEdit = IMorphusEditComponent;
