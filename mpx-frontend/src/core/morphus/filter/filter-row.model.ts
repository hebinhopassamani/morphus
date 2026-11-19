import { MpxAndOrCondicionalType } from '@core/morphus';
import { MpxFilterColumn } from './filter-column.model';
import { MpxFilterOperator } from './filter-operator.model';

export interface MpxFilterRow {
  id?: string;
  openParenthesis: boolean;
  column: MpxFilterColumn;
  operator: MpxFilterOperator;
  value?: unknown;
  closeParenthesis: boolean;
  andOr?: MpxAndOrCondicionalType;
}
