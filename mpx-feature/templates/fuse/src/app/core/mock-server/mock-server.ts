import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpParams,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject, Service } from '@angular/core';
import {
  defaultUrlMatcher,
  PRIMARY_OUTLET,
  Route,
  Router,
  UrlMatchResult,
} from '@angular/router';
import { Observable } from 'rxjs';
import {
  Context,
  ExtractedPathParams,
  Handler,
  HttpMethods,
  Path,
} from './models';
import { MOCK_SERVER_CONFIG } from './provider';
import { getStatusText } from './utils/http-status-text';

@Service()
export class MockServer {
  // Dependencies
  private mockServerConfig = inject(MOCK_SERVER_CONFIG);
  private router = inject(Router);

  // State
  private handlers = new Map<Path, Partial<Record<HttpMethods, Handler>>>();

  /**
   * Log the request, handler and response.
   */
  private log(
    type: 'bypass' | 'handler',
    details: {
      req: HttpRequest<unknown>;
      res?: HttpResponse<unknown> | HttpErrorResponse;
      message?: string;
      severity?: 'log' | 'error';
    }
  ) {
    // Don't log if bypass logging is disabled and the log type is "bypass"
    if (!this.mockServerConfig.logging.bypass && type === 'bypass') {
      return;
    }

    // Don't log if handler logging is disabled and the log type is "handler"
    if (!this.mockServerConfig.logging.handler && type === 'handler') {
      return;
    }

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds()}`;

    console.groupCollapsed(
      `%cMock Server - ${details.req.method} ${details.req.url.replace(/[:.]/g, '$&\u200B')} (${time})`,
      `padding:3px 8px; border-radius:5px; ${details.severity === 'error' || (details.res && details.res instanceof HttpErrorResponse) ? 'color:light-dark(#410E0B, #FADEDC); background:light-dark(#FCEBEB, #4E3534);' : ''}`
    );
    console.log('Request:', details.req);

    if (details.res) {
      if (details.res instanceof HttpResponse) {
        console.log('Response:', details.res);
      } else {
        console.error('Response:', details.res);
      }
    }

    if (details.message) {
      console[details.severity ?? 'log'](details.message);
    }

    console.groupEnd();
  }

  /**
   * Register a DELETE handler for the specified path.
   */
  delete<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['DELETE'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.DELETE]: handler as Handler,
      });
    }
  }

  /**
   * Register a GET handler for the specified path.
   */
  get<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['GET'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.GET]: handler as Handler,
      });
    }
  }

  /**
   * Register a HEAD handler for the specified path.
   */
  head<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['HEAD'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.HEAD]: handler as Handler,
      });
    }
  }

  /**
   * Register a OPTIONS handler for the specified path.
   */
  options<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['OPTIONS'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.OPTIONS]: handler as Handler,
      });
    }
  }

  /**
   * Register a PATCH handler for the specified path.
   */
  patch<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['PATCH'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.PATCH]: handler as Handler,
      });
    }
  }

  /**
   * Register a POST handler for the specified path.
   */
  post<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['POST'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.POST]: handler as Handler,
      });
    }
  }

  /**
   * Register a PUT handler for the specified path.
   */
  put<
    ParamsType = unknown,
    BodyType = unknown,
    ResponseType = unknown,
    PathType extends Path = Path,
  >(
    path: PathType,
    handler: Handler<
      ParamsType extends object ? ParamsType : ExtractedPathParams<PathType>,
      BodyType,
      ResponseType
    >
  ) {
    const normalizedPath = path.replace(/^\/+|\/+$/g, '');
    const current = this.handlers.get(normalizedPath);

    if (current) {
      current['PUT'] = handler as Handler;
    } else {
      this.handlers.set(normalizedPath, {
        [HttpMethods.PUT]: handler as Handler,
      });
    }
  }

  /**
   * Handle the mock API request and return the response with or without a delay.
   */
  handle(
    request: HttpRequest<unknown>
  ): Observable<HttpEvent<unknown>> | false {
    // Check if the request URL starts with the mock server base URL.
    // If not, log the details and bypass the mock server for this request.
    if (!request.url.startsWith(this.mockServerConfig.baseURL)) {
      this.log('bypass', {
        req: request,
        message: 'Request URL does not start with the base path',
        severity: 'error',
      });

      return false;
    }

    // Parse the request URL
    const requestURL = new URL(request.url);

    // Remove leading and trailing slashes from the request URL pathname
    // and parse it using the Angular Router
    const pathname = requestURL.pathname.replace(/^\/+|\/+$/g, '');
    const urlTree = this.router.parseUrl(pathname);

    // Find the matching handler if there is one
    let urlMatcherResult: UrlMatchResult | null = null;
    let matchingHandler: Partial<Record<HttpMethods, Handler>> | null = null;

    for (const [path, handler] of this.handlers) {
      // Prepare the route and segment group
      const route: Route = {
        path,
        pathMatch: 'full',
      };
      const segmentGroup =
        urlTree.root.children[PRIMARY_OUTLET] ?? urlTree.root;

      // Use the default URL matcher to match the URL. It never matches an
      // empty path, so the root path is matched separately.
      urlMatcherResult =
        path === '' && !segmentGroup.segments.length
          ? { consumed: [] }
          : defaultUrlMatcher(segmentGroup.segments, segmentGroup, route);

      // If a match was found, set the matching handler and break the loop
      if (urlMatcherResult) {
        matchingHandler = handler;
        break;
      }
    }

    // Return false if no matching handler was found
    if (urlMatcherResult === null || matchingHandler === null) {
      this.log('bypass', {
        req: request,
        message: 'No handler found for the request URL',
        severity: 'error',
      });

      return false;
    }

    // Extract the handler function from the matching handler
    const handler = matchingHandler[request.method as HttpMethods];

    // Return false if no handler was found for the request method
    if (!handler) {
      this.log('bypass', {
        req: request,
        message: 'No handler found for the request method',
        severity: 'error',
      });

      return false;
    }

    // Extract the path parameters from the URL matcher result
    let params = {};
    if (urlMatcherResult.posParams) {
      params = Object.fromEntries(
        Object.entries(urlMatcherResult.posParams).map(([path, segment]) => [
          path,
          segment.path,
        ])
      );
    }

    // Extract the query parameters from the request URL. If the request object
    // has HttpParams, use that instead.
    let queryParams = new HttpParams({
      fromString: requestURL.searchParams.toString(),
    });
    if (request.params.keys().length) {
      queryParams = request.params;
    }

    // Prepare the context object
    const context: Context = {
      req: {
        body: request.body,
        params: params,
        queryParams: queryParams,
        raw: request,
      },

      // Return a JSON response
      json: (body, options = {}) => ({
        status: options.status ?? 200,
        body,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...options.headers,
        },
      }),

      // Return a text response
      text: (body, options = {}) => ({
        status: options.status ?? 200,
        body,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          ...options.headers,
        },
      }),

      // Return a blob response
      blob: (body, options = {}) => ({
        status: options.status ?? 200,
        body,
        headers: {
          'Content-Type':
            body.type === '' ? 'application/octet-stream' : body.type,
          ...options.headers,
        },
      }),

      // Delay helper
      delay: async (delay: number) =>
        new Promise((resolve) => setTimeout(resolve, delay)),
    };

    // Return the response as an observable
    return new Observable((observer) => {
      const aborter = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      // Notify the observer that the request was sent
      observer.next({ type: HttpEventType.Sent });

      // Async IIFE
      (async () => {
        try {
          // Determine if the response from is async
          const responseOrPromise = handler(context);
          const isAsync =
            responseOrPromise &&
            typeof (responseOrPromise as PromiseLike<unknown>).then ===
              'function';

          // Determine the delay amount
          const delayAmount = isAsync ? 0 : this.mockServerConfig.delay;

          // Get the final response
          const response = await responseOrPromise;

          // Wait for the global delay if specified
          if (delayAmount > 0) {
            await new Promise(
              (resolve) => (timeoutId = setTimeout(resolve, delayAmount))
            );
          }

          // Don't send the response if the request was aborted
          if (aborter.signal.aborted) {
            return;
          }

          // Build the Http response
          const headers = new HttpHeaders(response.headers);
          const status = response.status;
          const statusText = getStatusText(status);
          const body = response.body;
          const url = request.url;

          // Success
          if (response.status >= 200 && response.status < 300) {
            const httpResponse = new HttpResponse({
              body,
              headers,
              status,
              statusText,
              url,
            });

            // Notify the observer of the response
            observer.next(httpResponse);
            observer.complete();

            // Log the details
            this.log('handler', { req: request, res: httpResponse });

            return;
          }

          // Error
          const httpErrorResponse = new HttpErrorResponse({
            error: body,
            headers,
            status,
            statusText,
            url,
          });

          // Notify the observer of the error
          observer.error(httpErrorResponse);

          // Log the details
          this.log('handler', { req: request, res: httpErrorResponse });
        } catch (error) {
          const httpErrorResponse = new HttpErrorResponse({ error });

          // Notify the observer of the error
          observer.error(httpErrorResponse);

          // Log the details
          this.log('handler', { req: request, res: httpErrorResponse });
        }
      })();

      return () => {
        aborter.abort();
        clearTimeout(timeoutId);
      };
    });
  }
}
