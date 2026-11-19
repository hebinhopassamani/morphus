import { MpxDataBaseType, MpxFilterColumnType } from '@core/morphus';
import { MpxFilterOperator } from './filter-operator.model';

export interface MpxMask {
  label?: string;
  mask?: string;
}

export interface MpxFilterColumn {
  label?: string;
  name?: string;
  dataType?: MpxFilterColumnType;
  operators?: MpxFilterOperator[];
  maxLength?: number;
  mask?: MpxMask;
  decimalPlaces?: number;
  optionsDefault?: unknown;
  optionsList?: Record<string, unknown>[];
  optionsValue?: string;
  optionsLabel?: string;
  optionsRelatedColumn?: string;
  optionsDataBaseType?: MpxDataBaseType;
  value?: unknown;
}

export interface MpxOptionSelectEvent {
  value?: unknown;
  column?: MpxFilterColumn;
}
