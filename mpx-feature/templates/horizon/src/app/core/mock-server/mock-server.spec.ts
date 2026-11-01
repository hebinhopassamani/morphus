import {
  FetchBackend,
  HttpErrorResponse,
  HttpEventType,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom, Observable, toArray } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { MockServerBackend } from './backend';
import { MockServer } from './mock-server';
import { provideMockServer } from './provider';

describe('MockServer', () => {
  describe('Main', () => {
    let mockServer: MockServer;
    let mockServerBackend: MockServerBackend;

    beforeEach(() => {
      vi.spyOn(console, 'groupCollapsed').mockImplementation(() => void 0);
      vi.spyOn(console, 'log').mockImplementation(() => void 0);
      vi.spyOn(console, 'error').mockImplementation(() => void 0);

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideMockServer({
            baseURL: 'https://mock-test.server',
            delay: 0,
            logging: {
              bypass: true,
              handler: true,
            },
          }),
        ],
      });

      mockServer = TestBed.inject(MockServer);
      mockServerBackend = TestBed.inject(MockServerBackend);
    });

    afterEach(() => {
      mockServer['handlers'].clear();
      vi.restoreAllMocks();
      TestBed.resetTestingModule();
    });

    describe('init', () => {
      it('should be created', () => {
        expect(mockServer).toBeTruthy();
      });

      it('should throw an error if base URL does not start with a protocol', () => {
        expect(() => {
          provideMockServer({
            baseURL: 'mock-test.server',
            delay: 0,
            logging: {
              bypass: true,
              handler: true,
            },
          });
        }).toThrow();
      });
    });

    describe('handler', () => {
      it('should pass through requests that do not match configured base URL', () => {
        const request = new HttpRequest('GET', 'https://mock-server');
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      /*it('should pass through requests that starts with a protocol and a domain without a matching base path', () => {
        const request = new HttpRequest(
          'GET',
          'https://dummy.com/mock-server/'
        );
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });*/

      it('should pass through requests with matching base URL but no registered handler', () => {
        const request = new HttpRequest(
          'GET',
          'https://mock-server.test/users'
        );
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests with no matching path', () => {
        mockServer.get('users', (c) => c.json(null));

        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/customers',
          {}
        );
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests with matching path but unregistered HTTP method', () => {
        mockServer.get('users', (c) => c.json(null));

        const request = new HttpRequest(
          'POST',
          'https://mock-test.server/users',
          {}
        );
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests that only match a registered path by prefix', () => {
        mockServer.get('/users', (c) => c.json(null));

        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/4'
        );
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests with a relative URL', () => {
        const request = new HttpRequest('GET', 'icons/custom-icons.svg');
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests with a root-relative URL matching a registered path', () => {
        mockServer.get('/assets/data.json', (c) => c.json(null));

        const request = new HttpRequest('GET', '/assets/data.json');
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests to the root path with no root handler', () => {
        mockServer.get('/users', (c) => c.json(null));

        const request = new HttpRequest('GET', 'https://mock-test.server/');
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should pass through requests with a path when only the root path is registered', () => {
        mockServer.get('/', (c) => c.json(null));

        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        expect(response).toBe(false);
      });

      it('should handle requests with a matching path', async () => {
        const expectedResponse = { id: '4' };

        mockServer.get('/users/:id', (c) => c.json({ id: c.req.params.id }));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/4'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests with a matching path but without the leading slash', async () => {
        const expectedResponse = { id: '4' };

        mockServer.get('users/:id', (c) => c.json({ id: c.req.params.id }));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/4'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests with a trailing slash', async () => {
        const expectedResponse = { success: true };

        mockServer.get('/users', (c) => c.json(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests with params and a trailing slash', async () => {
        const expectedResponse = { id: '4' };

        mockServer.get('/users/:id', (c) => c.json({ id: c.req.params.id }));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/4/'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests with a leading double slash', async () => {
        const expectedResponse = { success: true };

        mockServer.get('/users', (c) => c.json(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server//users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests to the root path', async () => {
        const expectedResponse = { root: true };

        mockServer.get('/', (c) => c.json(expectedResponse));
        const request = new HttpRequest('GET', 'https://mock-test.server/');
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests to the root path without the trailing slash', async () => {
        const expectedResponse = { root: true };

        mockServer.get('/', (c) => c.json(expectedResponse));
        const request = new HttpRequest('GET', 'https://mock-test.server');
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should use the existing registry items when adding more HTTP methods to an existing path', () => {
        const url = 'users';

        mockServer.get(url, (c) => c.json(null));
        mockServer.get(url, (c) => c.json(null));

        mockServer.head(url, (c) => c.json(null));
        mockServer.head(url, (c) => c.json(null));

        mockServer.options(url, (c) => c.json(null));
        mockServer.options(url, (c) => c.json(null));

        mockServer.delete(url, (c) => c.json(null));
        mockServer.delete(url, (c) => c.json(null));

        mockServer.post(url, (c) => c.json(null));
        mockServer.post(url, (c) => c.json(null));

        mockServer.put(url, (c) => c.json(null));
        mockServer.put(url, (c) => c.json(null));

        mockServer.patch(url, (c) => c.json(null));
        mockServer.patch(url, (c) => c.json(null));

        expect(mockServer['handlers'].size).toEqual(1);
      });

      it('should handle requests with query params', () => {
        mockServer.get('/users', (c) => c.json(null));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users?page=1&limit=10'
        );
        const response = mockServer.handle(request);

        expect(response).toBeTruthy();
      });

      it('should handle requests with params', async () => {
        const expectedResponse = { id: '4' };

        mockServer.get('/users/:id', (c) => c.json({ id: c.req.params.id }));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/4'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests with params when a shorter path is registered first', async () => {
        const expectedResponse = { id: '4' };

        mockServer.get('/users', (c) => c.json(null));
        mockServer.get('/users/:id', (c) => c.json({ id: c.req.params.id }));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users/4'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle requests with a method registered only on a longer path', async () => {
        const expectedResponse = null;

        mockServer.get('/users', (c) => c.json([]));
        mockServer.delete('/users/:id', (c) =>
          c.json(expectedResponse, { status: 204 })
        );
        const request = new HttpRequest(
          'DELETE',
          'https://mock-test.server/users/4'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(204);
          return true;
        });
      });

      it('should handle requests with both HttpParams and query params correctly', async () => {
        mockServer.get('/users', (c) => {
          const params = c.req.queryParams;
          return c.json({
            page: params.get('page'),
            limit: params.get('limit'),
          });
        });
        const expectedResponse = { page: '1', limit: '20' };

        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users?page=1&limit=10',
          {
            params: new HttpParams({
              fromObject: {
                page: 1,
                limit: 20,
              },
            }),
          }
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle mock server requests through the backend', async () => {
        const expectedResponse = { users: [{ id: 1, name: 'John' }] };

        mockServer.get('/users', (c) => c.json(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServerBackend.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle non-mock requests using real FetchBackend', async () => {
        const expectedResponse = { passed: true };
        const request = new HttpRequest('GET', 'httsp://example.com/api/users');

        vi.spyOn(FetchBackend.prototype, 'handle').mockImplementationOnce(
          () => {
            return new Observable((observer) => {
              observer.next(
                new HttpResponse({ body: expectedResponse, status: 200 })
              );
              observer.complete();
            });
          }
        );

        const events = await lastValueFrom(
          mockServerBackend.handle(request).pipe(toArray())
        );

        expect(events.length).toBe(1);
        expect(events[0]).toBeInstanceOf(HttpResponse);
        expect(events[0]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      describe('async', () => {
        beforeEach(() => {
          vi.useFakeTimers();
        });

        afterEach(() => {
          vi.useRealTimers();
        });

        it('should handle async functions', async () => {
          const expectedResponse = { users: [{ id: 1, name: 'John' }] };

          mockServer.get('/users', async (c) => {
            await c.delay(1000);
            return c.json(expectedResponse);
          });

          const request = new HttpRequest(
            'GET',
            'https://mock-test.server/users'
          );
          const response = mockServer.handle(request);

          if (!response) {
            expect.fail('Expected handle() to return an Observable');
          }

          const promise = lastValueFrom(response);

          vi.advanceTimersByTime(1000);

          const resolvedResponse = await promise;

          expect(resolvedResponse).toBeInstanceOf(HttpResponse);
          expect(resolvedResponse).toSatisfy(
            (response: HttpResponse<unknown>) => {
              expect(response.body).toEqual(expectedResponse);
              expect(response.status).toBe(200);
              return true;
            }
          );
        });

        it('should handle rejected Promises', async () => {
          mockServer.get('/users', (c) => {
            return new Promise((_, reject) => {
              setTimeout(
                () => reject(c.json({ message: 'Network error' })),
                1000
              );
            });
          });

          const request = new HttpRequest(
            'GET',
            'https://mock-test.server/users'
          );
          const response = mockServer.handle(request);

          if (!response) {
            expect.fail('Expected handle() to return an Observable');
          }

          const promise = lastValueFrom(response);

          vi.advanceTimersByTime(1000);

          await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
          await expect(promise).rejects.toSatisfy(
            (error: HttpErrorResponse) => {
              expect(error.status).toBe(0);
              return true;
            }
          );
        });

        it('should abort the request when unsubscribed before the request completed', async () => {
          const abortSpy = vi.fn();
          vi.spyOn(window, 'AbortController').mockImplementation(
            class MockAbortController {
              abort = abortSpy;
              get signal() {
                return {
                  get aborted() {
                    return abortSpy.mock.calls.length > 0;
                  },
                };
              }
            } as any
          );

          const expectedResponse = { users: [{ id: 1, name: 'John' }] };

          mockServer.get('/users', async (c) => {
            await c.delay(1000);
            return c.json(expectedResponse);
          });

          const request = new HttpRequest(
            'GET',
            'https://mock-test.server/users'
          );
          const response = mockServer.handle(request);

          if (!response) {
            expect.fail('Expected handle() to return an Observable');
          }

          const events: unknown[] = [];
          const subscription = response.subscribe((event) =>
            events.push(event)
          );

          vi.advanceTimersByTime(500);

          subscription.unsubscribe();

          vi.advanceTimersByTime(1000);

          expect(abortSpy).toHaveBeenCalledTimes(1);
          expect(events.length).toBe(1);
        });

        it('should not emit the response when unsubscribed before the handler resolved', async () => {
          mockServer.get('/users', async (c) => {
            await c.delay(1000);
            return c.json({ users: [{ id: 1, name: 'John' }] });
          });

          const request = new HttpRequest(
            'GET',
            'https://mock-test.server/users'
          );
          const response = mockServer.handle(request);

          if (!response) {
            expect.fail('Expected handle() to return an Observable');
          }

          const events: unknown[] = [];
          const errorSpy = vi.fn();
          const subscription = response.subscribe({
            next: (event) => events.push(event),
            error: errorSpy,
          });

          await vi.advanceTimersByTimeAsync(500);

          subscription.unsubscribe();

          await vi.advanceTimersByTimeAsync(1000);

          expect(events).toEqual([{ type: HttpEventType.Sent }]);
          expect(errorSpy).not.toHaveBeenCalled();
        });

        it('should delay the async response', async () => {
          const expectedResponse = { success: true };
          const delay = 1500;

          mockServer.get('/users', async (c) => {
            await c.delay(delay);
            return c.json(expectedResponse);
          });
          const request = new HttpRequest(
            'GET',
            'https://mock-test.server/users'
          );
          const response = mockServer.handle(request);

          if (!response) {
            expect.fail('Expected handle() to return an Observable');
          }

          const promise = lastValueFrom(response.pipe(toArray()));

          vi.advanceTimersByTime(delay);

          const events = await promise;

          expect(events.length).toBe(2);
          expect(events[0]).toEqual({ type: HttpEventType.Sent });
          expect(events[1]).toBeInstanceOf(HttpResponse);
          expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
            expect(response.body).toEqual(expectedResponse);
            expect(response.status).toBe(200);
            return true;
          });
        });

        it('should apply the global delay to synchronous responses', async () => {
          const delay = 1500;

          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
            providers: [
              provideMockServer({
                baseURL: 'https://mock-test.server',
                delay,
                logging: {
                  bypass: true,
                  handler: true,
                },
              }),
            ],
          });

          mockServer = TestBed.inject(MockServer);

          const expectedResponse = { success: true };

          mockServer.get('/users', (c) => c.json(expectedResponse));
          const request = new HttpRequest(
            'GET',
            'https://mock-test.server/users'
          );
          const response = mockServer.handle(request);

          if (!response) {
            expect.fail('Expected handle() to return an Observable');
          }

          const promise = lastValueFrom(response.pipe(toArray()));

          await vi.advanceTimersByTimeAsync(delay);

          const events = await promise;

          expect(events.length).toBe(2);
          expect(events[0]).toEqual({ type: HttpEventType.Sent });
          expect(events[1]).toBeInstanceOf(HttpResponse);
          expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
            expect(response.body).toEqual(expectedResponse);
            expect(response.status).toBe(200);
            return true;
          });
        });
      });

      it('should handle JSON response', async () => {
        const expectedResponse = { success: true };

        mockServer.get('/users', (c) => c.json(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle text response', async () => {
        const expectedResponse = 'hello';

        mockServer.get('/users', (c) => c.text(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle blob response', async () => {
        const expectedResponse = new Blob(['hello'], { type: 'plain/text' });

        mockServer.get('/users', (c) => c.blob(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle blob response with type fallback', async () => {
        const testFile = new File(['test content'], 'test.txt', { type: '' });

        mockServer.get('/file', (c) => c.blob(testFile));
        const request = new HttpRequest('GET', 'https://mock-test.server/file');
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.headers.get('Content-Type')).toBe(
            'application/octet-stream'
          );
          return true;
        });
      });
    });

    describe('DELETE requests', () => {
      it('should handle successful DELETE request', async () => {
        const expectedResponse = null;

        mockServer.delete('/users/3', (c) =>
          c.json(expectedResponse, { status: 204 })
        );
        const request = new HttpRequest(
          'DELETE',
          'https://mock-test.server/users/3'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(204);
          return true;
        });
      });

      it('should handle unsuccessful DELETE request', async () => {
        const expectedResponse = { error: 'Not found' };

        mockServer.delete('/users/3', (c) =>
          c.json(expectedResponse, { status: 404 })
        );
        const request = new HttpRequest(
          'DELETE',
          'https://mock-test.server/users/3'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(404);
            return true;
          }
        );
      });
    });

    describe('GET requests', () => {
      it('should handle successful GET request', async () => {
        const expectedResponse = { users: [{ id: 1, name: 'John' }] };

        mockServer.get('/users', (c) => c.json(expectedResponse));
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle unsuccessful GET request', async () => {
        const expectedResponse = { error: 'Not found' };

        mockServer.get('/users', (c) =>
          c.json(expectedResponse, { status: 404 })
        );
        const request = new HttpRequest(
          'GET',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events: unknown[] = [];
        response.subscribe({
          next: (event) => events.push(event),
          error: (event) => events.push(event),
        });

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(404);
            return true;
          }
        );
      });
    });

    describe('HEAD requests', () => {
      it('should handle successful HEAD request', async () => {
        const expectedResponse = null;

        mockServer.head('/users', (c) =>
          c.json(null, { headers: { 'Content-Length': '1024' } })
        );
        const request = new HttpRequest(
          'HEAD',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.headers.get('Content-Length')).toBe('1024');
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle unsuccessful HEAD request', async () => {
        const expectedResponse = null;

        mockServer.head('/users', (c) =>
          c.json(expectedResponse, { status: 404 })
        );
        const request = new HttpRequest(
          'HEAD',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(404);
            return true;
          }
        );
      });
    });

    describe('OPTIONS requests', () => {
      it('should handle successful OPTIONS request', async () => {
        const expectedResponse = null;

        mockServer.options('/users', (c) =>
          c.json(null, {
            headers: {
              Allow: 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
          })
        );
        const request = new HttpRequest(
          'OPTIONS',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.headers.get('Allow')).toBe(
            'GET, POST, PUT, DELETE, OPTIONS'
          );
          expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
            'GET, POST, PUT, DELETE, OPTIONS'
          );
          expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
            'Content-Type, Authorization'
          );
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle unsuccessful OPTIONS request', async () => {
        const expectedResponse = null;

        mockServer.options('/users', (c) =>
          c.json(expectedResponse, { status: 403 })
        );
        const request = new HttpRequest(
          'OPTIONS',
          'https://mock-test.server/users'
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(403);
            return true;
          }
        );
      });
    });

    describe('PATCH requests', () => {
      it('should handle successful PATCH request', async () => {
        const expectedResponse = { id: 3, name: 'John' };

        mockServer.patch('/users', (c) => c.json(c.req.body));
        const request = new HttpRequest(
          'PATCH',
          'https://mock-test.server/users',
          expectedResponse
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle unsuccessful PATCH request', async () => {
        const expectedResponse = { error: 'Not found' };

        mockServer.patch('/users', (c) =>
          c.json(expectedResponse, { status: 404 })
        );
        const request = new HttpRequest(
          'PATCH',
          'https://mock-test.server/users',
          {}
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(404);
            return true;
          }
        );
      });
    });

    describe('POST requests', () => {
      it('should handle successful POST request', async () => {
        const expectedResponse = { id: 3, name: 'John' };

        mockServer.post('/users', (c) => c.json(c.req.body));
        const request = new HttpRequest(
          'POST',
          'https://mock-test.server/users',
          expectedResponse
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle unsuccessful POST request', async () => {
        const expectedResponse = { error: 'Not found' };

        mockServer.post('/users', (c) =>
          c.json(expectedResponse, { status: 404 })
        );
        const request = new HttpRequest(
          'POST',
          'https://mock-test.server/users',
          {}
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(404);
            return true;
          }
        );
      });
    });

    describe('PUT requests', () => {
      it('should handle successful PUT request', async () => {
        const expectedResponse = { id: 3, name: 'John' };

        mockServer.put('/users', (c) => c.json(c.req.body));
        const request = new HttpRequest(
          'PUT',
          'https://mock-test.server/users',
          expectedResponse
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const events = await lastValueFrom(response.pipe(toArray()));

        expect(events.length).toBe(2);
        expect(events[0]).toEqual({ type: HttpEventType.Sent });
        expect(events[1]).toBeInstanceOf(HttpResponse);
        expect(events[1]).toSatisfy((response: HttpResponse<unknown>) => {
          expect(response.body).toEqual(expectedResponse);
          expect(response.status).toBe(200);
          return true;
        });
      });

      it('should handle unsuccessful PUT request', async () => {
        const expectedResponse = { error: 'Not found' };

        mockServer.put('/users', (c) =>
          c.json(expectedResponse, { status: 404 })
        );
        const request = new HttpRequest(
          'PUT',
          'https://mock-test.server/users',
          {}
        );
        const response = mockServer.handle(request);

        if (!response) {
          expect.fail('Expected handle() to return an Observable');
        }

        const promise = lastValueFrom(response.pipe(toArray()));

        await expect(promise).rejects.toBeInstanceOf(HttpErrorResponse);
        await expect(promise).rejects.toSatisfy(
          (response: HttpErrorResponse) => {
            expect(response.status).toBe(404);
            return true;
          }
        );
      });
    });
  });

  describe('Logger', () => {
    let mockServer: MockServer;
    let consoleLogMock: Mock;
    let consoleErrorMock: Mock;

    beforeEach(() => {
      consoleLogMock = vi.fn();
      consoleErrorMock = vi.fn();

      vi.spyOn(console, 'log').mockImplementation(consoleLogMock);
      vi.spyOn(console, 'error').mockImplementation(consoleErrorMock);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      TestBed.resetTestingModule();
    });

    it('should disable logging completely', () => {
      TestBed.configureTestingModule({
        providers: [
          provideMockServer({
            baseURL: 'https://mock-test.server',
            delay: 0,
            logging: {
              bypass: false,
              handler: false,
            },
          }),
        ],
      });

      mockServer = TestBed.inject(MockServer);

      mockServer['log']('bypass', {
        req: new HttpRequest('GET', 'test-url'),
      });

      mockServer['log']('handler', {
        req: new HttpRequest('GET', 'test-url'),
      });

      expect(consoleLogMock).not.toHaveBeenCalled();
    });

    it('should not log bypass when bypass logging is disabled', () => {
      TestBed.configureTestingModule({
        providers: [
          provideMockServer({
            baseURL: 'https://mock-test.server',
            delay: 0,
            logging: {
              bypass: false,
              handler: true,
            },
          }),
        ],
      });

      mockServer = TestBed.inject(MockServer);

      mockServer['log']('bypass', {
        req: new HttpRequest('GET', 'test-url'),
        message: 'Bypassing request',
      });

      expect(consoleLogMock).not.toHaveBeenCalled();
    });

    it('should not log handler when handler logging is disabled', () => {
      TestBed.configureTestingModule({
        providers: [
          provideMockServer({
            baseURL: 'https://mock-test.server',
            delay: 0,
            logging: {
              bypass: true,
              handler: false,
            },
          }),
        ],
      });

      mockServer = TestBed.inject(MockServer);

      mockServer['log']('handler', {
        req: new HttpRequest('GET', 'test-url'),
        message: 'Handling request',
      });

      expect(consoleLogMock).not.toHaveBeenCalled();
    });

    it('should respect the "log" severity level', () => {
      TestBed.configureTestingModule({
        providers: [
          provideMockServer({
            baseURL: 'https://mock-test.server',
            delay: 0,
            logging: {
              bypass: true,
              handler: true,
            },
          }),
        ],
      });

      mockServer = TestBed.inject(MockServer);

      mockServer['log']('handler', {
        req: new HttpRequest('GET', 'test-url'),
        message: 'Handling request',
      });

      expect(consoleLogMock).toHaveBeenCalled();
    });

    it('should respect the "error" severity level', () => {
      TestBed.configureTestingModule({
        providers: [
          provideMockServer({
            baseURL: 'https://mock-test.server',
            delay: 0,
            logging: {
              bypass: true,
              handler: true,
            },
          }),
        ],
      });

      mockServer = TestBed.inject(MockServer);

      mockServer['log']('handler', {
        req: new HttpRequest('GET', 'test-url'),
        message: 'Handling request',
        severity: 'error',
      });

      expect(consoleErrorMock).toHaveBeenCalled();
    });
  });
});
