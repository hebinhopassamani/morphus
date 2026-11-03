import { DataBaseType, FilterColumnType } from '@core/mpx-types';
import { FilterOperator } from './filter-operator.interface';

export interface MorphusMask {
  label?: string;
  mask?: string;
}

export interface FilterColumn {
  label?: string;
  name?: string;
  dataType?: FilterColumnType;
  operators?: FilterOperator[];
  maxLength?: number;
  mask?: MorphusMask;
  decimalPlaces?: number;
  optionsDefault?: unknown;
  optionsList?: Record<string, unknown>[];
  optionsValue?: string;
  optionsLabel?: string;
  optionsRelatedColumn?: string;
  optionsDataBaseType?: DataBaseType;
  value?: unknown;
}

export interface OptionSelectEvent {
  value?: unknown;
  column?: FilterColumn;
}
