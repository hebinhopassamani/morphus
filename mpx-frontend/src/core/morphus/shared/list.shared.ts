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

export const MpxListShared = [
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
