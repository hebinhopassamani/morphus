import { MpxFilterOperatorEnum, MpxFilterOperatorValue } from '../enums/filter-operator.enum';
import { MpxFilterOperator } from '../filter/filter-operator.model';
import { MpxFilterOperatorType } from '../types/filter.types';

export const MpxDefaultFilterOperator: MpxFilterOperator = {
  key: undefined,
  value: undefined,
  label: 'Operador',
};

export const MpxDefaultFilterOperators: MpxFilterOperatorType[] = [
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

export const MPX_DEFAULT_EQUAL: MpxFilterOperator = {
  key: 'EQUAL',
  label: MpxFilterOperatorEnum.EQUAL,
  value: MpxFilterOperatorValue.EQUAL,
};

export const MPX_DEFAULT_NOT_EQUAL: MpxFilterOperator = {
  key: 'NOT_EQUAL',
  label: MpxFilterOperatorEnum.NOT_EQUAL,
  value: MpxFilterOperatorValue.NOT_EQUAL,
};

export const MPX_DEFAULT_LIKE_WITH: MpxFilterOperator = {
  key: 'LIKE_WITH',
  label: MpxFilterOperatorEnum.LIKE_WITH,
  value: MpxFilterOperatorValue.LIKE_WITH,
};

export const MPX_DEFAULT_START_WITH: MpxFilterOperator = {
  key: 'START_WITH',
  label: MpxFilterOperatorEnum.START_WITH,
  value: MpxFilterOperatorValue.START_WITH,
};

export const MPX_DEFAULT_END_WITH: MpxFilterOperator = {
  key: 'END_WITH',
  label: MpxFilterOperatorEnum.END_WITH,
  value: MpxFilterOperatorValue.END_WITH,
};

export const MPX_DEFAULT_BIGGER: MpxFilterOperator = {
  key: 'BIGGER',
  label: MpxFilterOperatorEnum.BIGGER,
  value: MpxFilterOperatorValue.BIGGER,
};

export const MPX_DEFAULT_BIGGER_OR_EQUAL: MpxFilterOperator = {
  key: 'BIGGER_OR_EQUAL',
  label: MpxFilterOperatorEnum.BIGGER_OR_EQUAL,
  value: MpxFilterOperatorValue.BIGGER_OR_EQUAL,
};

export const MPX_DEFAULT_SMALLER: MpxFilterOperator = {
  key: 'SMALLER',
  label: MpxFilterOperatorEnum.SMALLER,
  value: MpxFilterOperatorValue.SMALLER,
};

export const MPX_DEFAULT_SMALLER_OR_EQUAL: MpxFilterOperator = {
  key: 'SMALLER_OR_EQUAL',
  label: MpxFilterOperatorEnum.SMALLER_OR_EQUAL,
  value: MpxFilterOperatorValue.SMALLER_OR_EQUAL,
};
