import {
  MFILTER_OPERATOR_ENUM,
  MFILTER_OPERATOR_VALUE,
} from '@core/mpx-enums';

export type FilterColumnType =
  | 'int'
  | 'guid'
  | 'text'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'email'
  | 'cpf'
  | 'cnpj'
  | 'select_list';

export type DataBaseType =
  | 'int'
  | 'guid'
  | 'text'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime';

export type AndOrCondicionalType = 'And' | 'Or';

export type MFILTER_OPERATOR_TYPE = keyof typeof MFILTER_OPERATOR_ENUM;
export type MFILTER_OPERATOR_VALUE_TYPE = keyof typeof MFILTER_OPERATOR_VALUE;
