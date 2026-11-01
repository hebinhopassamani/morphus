import { FetchBackend, HttpEvent, HttpRequest } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { MockServer } from './mock-server';

@Service()
export class MockServerBackend extends FetchBackend {
  // Dependencies
  private mockServer = inject(MockServer);

  /**
   * Handle the HTTP request.
   */
  override handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    // Get the result from the mock server
    const result = this.mockServer.handle(req);

    // Either return the result or let the request pass through
    return result ? result : super.handle(req);
  }
}
