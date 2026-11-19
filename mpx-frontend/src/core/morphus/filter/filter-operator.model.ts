import { MpxAndOrCondicionalType, MpxFilterOperatorType } from '@core/morphus';

export interface MpxFilterOperator {
  key?: MpxFilterOperatorType;
  label?: string;
  value?: string;
}

export interface MpxFilterAndOr {
  label?: string;
  value?: MpxAndOrCondicionalType;
}
