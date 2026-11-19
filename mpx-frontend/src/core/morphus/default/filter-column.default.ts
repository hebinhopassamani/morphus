import { MpxFilterColumn } from '../filter/filter-column.model';
import { MpxDefaultFilterOperator } from './filter-operator.default';

export const MpxDefaultFilterColumn: MpxFilterColumn = {
  name: undefined,
  label: 'Coluna',
  operators: [MpxDefaultFilterOperator],
  value: undefined,
};
