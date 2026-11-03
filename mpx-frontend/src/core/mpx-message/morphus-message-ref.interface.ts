import { Observable } from 'rxjs';
import { ResultType } from '@core/mpx-types';
import { IMorphusMessage } from './morphus-message.interface';
import { IMorphusModalResult } from './morphus-modal-result.interface';

export interface IMorphusMessageRef<T = unknown> {
  readonly message: IMorphusMessage<T>;
  afterClosed(): Observable<IMorphusModalResult<T>>;
  close(resultType?: ResultType): void;
}
