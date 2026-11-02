import { AndOrCondicionalType, MFILTER_OPERATOR_TYPE } from './filter-operator.enum';

export interface FilterOperator {
  key?: MFILTER_OPERATOR_TYPE;
  label?: string;
  value?: string;
}

export interface FilterAndOr {
  label?: string;
  value?: AndOrCondicionalType;
}
