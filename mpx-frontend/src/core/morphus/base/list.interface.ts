import { MpxFilter } from '@core/morphus';
import { IMpxBaseComponent } from './base.interface';

export interface IMpxListComponent extends IMpxBaseComponent {
  loadList(filter?: MpxFilter): Promise<void>;
  newEntity(): void;
  openFilter(): void;
  onFilter(): Promise<void>;
  onFilterClear(): Promise<void>;
  onFilterClose(): void;
}
