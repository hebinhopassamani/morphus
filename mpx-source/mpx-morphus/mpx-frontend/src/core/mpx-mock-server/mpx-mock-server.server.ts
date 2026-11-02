import { FetchBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MpxMockServer } from './mpx.mock-server';

@Injectable({
  providedIn: 'root',
})
export class MpxMockServerBackend extends FetchBackend {
  // Dependencies
  private MpxMockServer = inject(MpxMockServer);

  /**
   * Handle the HTTP request.
   */
  override handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    // Get the result from the mock server
    const result = this.MpxMockServer.handle(req);

    // Either return the result or let the request pass through
    return result ? result : super.handle(req);
  }
}
