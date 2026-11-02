import { FilterColumn } from './filter-column.interface';
import { AndOrCondicionalType } from './filter-operator.enum';
import { FilterOperator } from './filter-operator.interface';

export interface FilterRow {
  id?: string;
  openParenthesis: boolean;
  column: FilterColumn;
  operator: FilterOperator;
  value?: unknown;
  closeParenthesis: boolean;
  andOr?: AndOrCondicionalType;
}
