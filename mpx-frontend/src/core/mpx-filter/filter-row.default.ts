import { DefaultFilterColumn } from './filter-column.default';
import { DefaultFilterOperator } from './filter-operator.default';
import { FilterRow } from './filter-row.interface';

export const DefaultFilterRow: FilterRow = {
  openParenthesis: false,
  column: { ...DefaultFilterColumn },
  operator: { ...DefaultFilterOperator },
  value: undefined,
  closeParenthesis: false,
  andOr: undefined,
};
