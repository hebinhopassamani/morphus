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

export enum MFILTER_OPERATOR_VALUE {
  EQUAL = '=',
  NOT_EQUAL = '<>',
  LIKE_WITH = 'like',
  START_WITH = 'like',
  END_WITH = 'like',
  BIGGER = '>',
  BIGGER_OR_EQUAL = '>=',
  SMALLER = '<',
  SMALLER_OR_EQUAL = '<=',
}

export enum MFILTER_OPERATOR_ENUM {
  EQUAL = 'Igual à',
  NOT_EQUAL = 'Diferente de',
  LIKE_WITH = 'Parece com',
  START_WITH = 'Começa com',
  END_WITH = 'Termina com',
  BIGGER = 'Maior que',
  BIGGER_OR_EQUAL = 'Maior ou igual que',
  SMALLER = 'Menor que',
  SMALLER_OR_EQUAL = 'Menor ou igual que',
}

export type MFILTER_OPERATOR_TYPE = keyof typeof MFILTER_OPERATOR_ENUM;
export type MFILTER_OPERATOR_VALUE_TYPE = keyof typeof MFILTER_OPERATOR_VALUE;
