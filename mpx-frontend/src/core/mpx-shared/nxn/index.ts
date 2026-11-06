import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';

export * from '@angular/forms';
export * from '@angular/material/button';
export * from '@angular/material/checkbox';
export * from '@angular/material/icon';
export * from '@angular/material/input';
export * from '@angular/material/select';
export * from '@angular/material/tabs';
export * from '@angular/material/tooltip';
export * from '@core/mpx-base';
export * from '@core/mpx-default';
export * from '@core/mpx-utils';

/**
 * Imports visuais padrão obrigatórios para telas de Relacionamento N:N (MorphusNxNComponent).
 */
export const MorphusNxNShared = [
  FormsModule,
  MatButton,
  MatIconButton,
  MatCheckbox,
  MatIcon,
  MatFormField,
  MatLabel,
  MatInput,
  MatPrefix,
  MatSuffix,
  MatSelect,
  MatOption,
  MatTabGroup,
  MatTab,
  MatTooltip,
] as const;
