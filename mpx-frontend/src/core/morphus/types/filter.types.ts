import { MpxFilterOperatorEnum, MpxFilterOperatorValue } from '@core/morphus';

export type MpxFilterColumnType =
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

export type MpxDataBaseType =
  | 'int'
  | 'guid'
  | 'text'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime';

export type MpxAndOrCondicionalType = 'And' | 'Or';

export type MpxFilterOperatorType = keyof typeof MpxFilterOperatorEnum;
export type MpxFilterOperatorValueType = keyof typeof MpxFilterOperatorValue;
