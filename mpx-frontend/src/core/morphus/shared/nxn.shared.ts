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

export const MpxNxnShared = [
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
