import { ResultType } from '@core/mpx-types';

export interface IMorphusModalResult<T = unknown> {
  resultType: ResultType;
  data?: T;
}
