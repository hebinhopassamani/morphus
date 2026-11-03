import { authInterceptor, provideAuth } from '@core/mpx-auth';
import { mpxErrorHttpInterceptor, provideError } from '@core/mpx-error';
import { provideIcons } from '@core/mpx-icons';
import { provideLocalStorage } from '@core/mpx-local-storage';
import { provideMedia } from '@core/mpx-media';
import { provideMockServer } from '@core/mpx-mock-server';
import { provideTheming } from '@core/mpx-theming';
import { provideViewportScroller } from '@core/mpx-viewport-scroller';
import { provideWindow } from '@core/mpx-window';
import { environment } from '@/environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from '@angular/material/progress-spinner';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideError(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), withPreloading(PreloadAllModules)),
    provideClientHydration(withEventReplay()),

    provideHttpClient(withInterceptors([authInterceptor, mpxErrorHttpInterceptor])),

    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    { provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS, useValue: { diameter: 32 } },
    { provide: MAT_TABS_CONFIG, useValue: { stretchTabs: false } },
    provideMockServer({ baseURL: 'https://mock.server', delay: 0, logging: { handler: true, bypass: false } }),
    provideAuth({ ...environment.auth0, errorPath: '/security/signin' }),
    provideIcons(),
    provideLocalStorage(),
    provideMedia(),
    provideTheming({ scheme: 'system', primary: '#6E56CF', error: '#E5484D', neutral: '#8E8C99' }),
    provideViewportScroller(),
    provideWindow(),
  ],
};
