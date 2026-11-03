import { signal } from '@angular/core';
import { MFILTER_OPERATOR_ENUM, MFILTER_OPERATOR_VALUE } from '@core/mpx-enums';
import { MFILTER_OPERATOR_TYPE } from '@core/mpx-types';
import { FilterAndOr, FilterOperator } from './filter-operator.interface';

export const DefaultFilterOperator: FilterOperator = {
  key: undefined,
  value: undefined,
  label: 'Operador',
};

export const DefaultFilterAndOr: FilterAndOr = {
  value: undefined,
  label: '...',
};

export const andOrOptions = signal<FilterAndOr[]>([
  { label: '...', value: undefined },
  { label: 'And', value: 'And' },
  { label: 'Or', value: 'Or' },
]);

export const DefaultFilterOperators: MFILTER_OPERATOR_TYPE[] = [
  'EQUAL',
  'NOT_EQUAL',
  'SMALLER_OR_EQUAL',
  'SMALLER',
  'BIGGER_OR_EQUAL',
  'BIGGER',
  'LIKE_WITH',
  'START_WITH',
  'END_WITH',
];

export const DEFAULT_EQUAL: FilterOperator = {
  key: 'EQUAL',
  label: MFILTER_OPERATOR_ENUM.EQUAL,
  value: MFILTER_OPERATOR_VALUE.EQUAL,
};

export const DEFAULT_NOT_EQUAL: FilterOperator = {
  key: 'NOT_EQUAL',
  label: MFILTER_OPERATOR_ENUM.NOT_EQUAL,
  value: MFILTER_OPERATOR_VALUE.NOT_EQUAL,
};

export const DEFAULT_LIKE_WITH: FilterOperator = {
  key: 'LIKE_WITH',
  label: MFILTER_OPERATOR_ENUM.LIKE_WITH,
  value: MFILTER_OPERATOR_VALUE.LIKE_WITH,
};

export const DEFAULT_START_WITH: FilterOperator = {
  key: 'START_WITH',
  label: MFILTER_OPERATOR_ENUM.START_WITH,
  value: MFILTER_OPERATOR_VALUE.START_WITH,
};

export const DEFAULT_END_WITH: FilterOperator = {
  key: 'END_WITH',
  label: MFILTER_OPERATOR_ENUM.END_WITH,
  value: MFILTER_OPERATOR_VALUE.END_WITH,
};

export const DEFAULT_BIGGER: FilterOperator = {
  key: 'BIGGER',
  label: MFILTER_OPERATOR_ENUM.BIGGER,
  value: MFILTER_OPERATOR_VALUE.BIGGER,
};

export const DEFAULT_BIGGER_OR_EQUAL: FilterOperator = {
  key: 'BIGGER_OR_EQUAL',
  label: MFILTER_OPERATOR_ENUM.BIGGER_OR_EQUAL,
  value: MFILTER_OPERATOR_VALUE.BIGGER_OR_EQUAL,
};

export const DEFAULT_SMALLER: FilterOperator = {
  key: 'SMALLER',
  label: MFILTER_OPERATOR_ENUM.SMALLER,
  value: MFILTER_OPERATOR_VALUE.SMALLER,
};

export const DEFAULT_SMALLER_OR_EQUAL: FilterOperator = {
  key: 'SMALLER_OR_EQUAL',
  label: MFILTER_OPERATOR_ENUM.SMALLER_OR_EQUAL,
  value: MFILTER_OPERATOR_VALUE.SMALLER_OR_EQUAL,
};
