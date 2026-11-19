import { Observable } from 'rxjs';
import { MpxResultType } from '@core/morphus';
import { MpxMessage } from './message.model';
import { MpxModalResult } from './modal-result.model';

export interface MpxMessageRef<T = unknown> {
  readonly message: MpxMessage<T>;
  afterClosed(): Observable<MpxModalResult<T>>;
  close(resultType?: MpxResultType): void;
}
