import { MpxFilterRow } from '../filter/filter-row.model';
import { MpxDefaultFilterColumn } from './filter-column.default';
import { MpxDefaultFilterOperator } from './filter-operator.default';

export const MpxDefaultFilterRow: MpxFilterRow = {
  openParenthesis: false,
  column: { ...MpxDefaultFilterColumn },
  operator: { ...MpxDefaultFilterOperator },
  value: undefined,
  closeParenthesis: false,
  andOr: undefined,
};
