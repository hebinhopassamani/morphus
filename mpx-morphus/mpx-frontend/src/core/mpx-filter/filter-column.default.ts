import { FilterColumn } from './filter-column.interface';
import { DefaultFilterOperator } from './filter-operator.default';

export const DefaultFilterColumn: FilterColumn = {
  name: undefined,
  label: 'Coluna',
  operators: [DefaultFilterOperator],
  value: undefined,
};
