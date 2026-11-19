import {
  MPX_DEFAULT_BIGGER,
  MPX_DEFAULT_BIGGER_OR_EQUAL,
  MPX_DEFAULT_END_WITH,
  MPX_DEFAULT_EQUAL,
  MPX_DEFAULT_LIKE_WITH,
  MPX_DEFAULT_NOT_EQUAL,
  MPX_DEFAULT_SMALLER,
  MPX_DEFAULT_SMALLER_OR_EQUAL,
  MPX_DEFAULT_START_WITH,
  MpxDefaultFilterOperator,
} from '../default/filter-operator.default';
import { MpxDefaultFilterRow } from '../default/filter-row.default';
import { MpxFilterOperatorType } from '@core/morphus';
import { MpxFilterColumn } from './filter-column.model';
import { MpxFilterOperator } from './filter-operator.model';
import { MpxFilterRow } from './filter-row.model';

export class MpxFilterBuilder {
  public column: MpxFilterColumn;

  constructor(column: MpxFilterColumn) {
    this.column = column;
    this.column.operators = [MpxDefaultFilterOperator];
  }

  public addOperator(operatorType: MpxFilterOperatorType): this {
    if (!this.column.operators) {
      this.column.operators = [MpxDefaultFilterOperator];
    }
    this.column.operators.push(MpxFilterBuilder.getOperatorByOperatorType(operatorType));
    return this;
  }

  public addFilterColumn(filterColumn: MpxFilterColumn): this {
    this.column = filterColumn;
    return this;
  }

  public static getOperatorByOperatorType(type: MpxFilterOperatorType): MpxFilterOperator {
    switch (type) {
      case 'EQUAL':
        return MPX_DEFAULT_EQUAL;
      case 'NOT_EQUAL':
        return MPX_DEFAULT_NOT_EQUAL;
      case 'LIKE_WITH':
        return MPX_DEFAULT_LIKE_WITH;
      case 'START_WITH':
        return MPX_DEFAULT_START_WITH;
      case 'END_WITH':
        return MPX_DEFAULT_END_WITH;
      case 'BIGGER':
        return MPX_DEFAULT_BIGGER;
      case 'BIGGER_OR_EQUAL':
        return MPX_DEFAULT_BIGGER_OR_EQUAL;
      case 'SMALLER':
        return MPX_DEFAULT_SMALLER;
      case 'SMALLER_OR_EQUAL':
        return MPX_DEFAULT_SMALLER_OR_EQUAL;
    }
  }

  public static createNewFilterRow(): MpxFilterRow {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    return {
      ...MpxDefaultFilterRow,
      id,
      column: { ...MpxDefaultFilterRow.column },
      operator: { ...MpxDefaultFilterRow.operator },
    };
  }
}
