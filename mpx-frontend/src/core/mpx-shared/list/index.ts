import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { MpxFilterComponent } from '@/components/morphus/filter';

export * from '@angular/forms';
export * from '@angular/material/button';
export * from '@angular/material/divider';
export * from '@angular/material/icon';
export * from '@angular/material/input';
export * from '@angular/material/menu';
export * from '@angular/material/select';
export * from '@angular/material/table';
export * from '@angular/material/tooltip';
export * from '@core/mpx-base';
export * from '@core/mpx-default';
export * from '@core/mpx-filter';
export * from '@core/mpx-utils';
export * from '@/components/morphus/filter';

/**
 * Imports visuais padrão obrigatórios para telas de Listagem (MorphusListComponent).
 */
export const MorphusListShared = [
  FormsModule,
  MatTableModule,
  MatButton,
  MatIconButton,
  MatDivider,
  MatFormField,
  MatLabel,
  MatInput,
  MatPrefix,
  MatSuffix,
  MatIcon,
  MatSelect,
  MatOption,
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
  MatTooltip,
  MpxFilterComponent,
] as const;
