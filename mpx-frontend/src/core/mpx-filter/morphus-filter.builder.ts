import { FilterColumn } from './filter-column.interface';
import {
  DEFAULT_BIGGER,
  DEFAULT_BIGGER_OR_EQUAL,
  DEFAULT_END_WITH,
  DEFAULT_EQUAL,
  DEFAULT_LIKE_WITH,
  DEFAULT_NOT_EQUAL,
  DEFAULT_SMALLER,
  DEFAULT_SMALLER_OR_EQUAL,
  DEFAULT_START_WITH,
  DefaultFilterOperator,
} from './filter-operator.default';
import { MFILTER_OPERATOR_TYPE } from '@core/mpx-types';
import { FilterOperator } from './filter-operator.interface';
import { DefaultFilterRow } from './filter-row.default';
import { FilterRow } from './filter-row.interface';

export class MorphusFilterBuilder {
  public column: FilterColumn;

  constructor(column: FilterColumn) {
    this.column = column;
    this.column.operators = [DefaultFilterOperator];
  }

  public addOperator(operatorType: MFILTER_OPERATOR_TYPE): this {
    if (!this.column.operators) {
      this.column.operators = [DefaultFilterOperator];
    }
    this.column.operators.push(MorphusFilterBuilder.getOperatorByOperatorType(operatorType));
    return this;
  }

  public addFilterColumn(filterColumn: FilterColumn): this {
    this.column = filterColumn;
    return this;
  }

  public static getOperatorByOperatorType(type: MFILTER_OPERATOR_TYPE): FilterOperator {
    switch (type) {
      case 'EQUAL':
        return DEFAULT_EQUAL;
      case 'NOT_EQUAL':
        return DEFAULT_NOT_EQUAL;
      case 'LIKE_WITH':
        return DEFAULT_LIKE_WITH;
      case 'START_WITH':
        return DEFAULT_START_WITH;
      case 'END_WITH':
        return DEFAULT_END_WITH;
      case 'BIGGER':
        return DEFAULT_BIGGER;
      case 'BIGGER_OR_EQUAL':
        return DEFAULT_BIGGER_OR_EQUAL;
      case 'SMALLER':
        return DEFAULT_SMALLER;
      case 'SMALLER_OR_EQUAL':
        return DEFAULT_SMALLER_OR_EQUAL;
    }
  }

  public static createNewFilterRow(): FilterRow {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
      ...DefaultFilterRow,
      id,
      column: { ...DefaultFilterRow.column },
      operator: { ...DefaultFilterRow.operator },
    };
  }
}

export { MorphusFilterBuilder as MorphusFilterClass };
