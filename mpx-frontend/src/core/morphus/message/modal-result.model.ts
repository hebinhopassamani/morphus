import { MpxResultType } from '@core/morphus';

export interface MpxModalResult<T = unknown> {
  resultType: MpxResultType;
  data?: T;
}
