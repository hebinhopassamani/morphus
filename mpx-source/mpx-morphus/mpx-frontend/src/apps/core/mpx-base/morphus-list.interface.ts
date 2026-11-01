import { MorphusFilter } from './morphus-filter.interface';
import { IMorphusComponent } from './morphus.interface';

export interface IMorphusListComponent extends IMorphusComponent {
  loadList(filter?: MorphusFilter): Promise<void>;
  newEntity(): void;
  openFilter(): void;
  onFilter(): Promise<void>;
  onFilterClear(): Promise<void>;
  onFilterClose(): void;
}
