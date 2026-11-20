import { MpxSecurityInterceptor, MpxSecurityProvider } from '@core/morphus';
import { MpxErrorHttpInterceptor, MpxErrorProvider } from '@core/morphus';
import { MpxIconsProvider } from '@core/morphus';
import { MpxLocalStorageProvider } from '@core/morphus';
import { MpxMediaProvider } from '@core/morphus';
import { MpxMockServerProvider } from '@core/morphus';
import { MpxThemingProvider } from '@core/morphus';
import { MpxViewportScrollerProvider } from '@core/morphus';
import { MpxWindowProvider } from '@core/morphus';
import { environment } from '@/environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from '@angular/material/progress-spinner';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    MpxErrorProvider(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
      withPreloading(PreloadAllModules),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
    provideClientHydration(withEventReplay()),

    provideHttpClient(withInterceptors([MpxSecurityInterceptor, MpxErrorHttpInterceptor])),

    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { subscriptSizing: 'dynamic' } },
    { provide: MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS, useValue: { diameter: 32 } },
    { provide: MAT_TABS_CONFIG, useValue: { stretchTabs: false } },
    MpxMockServerProvider({ baseURL: 'https://mock.server', delay: 0, logging: { handler: true, bypass: false } }),
    MpxSecurityProvider({ ...environment.auth0, errorPath: '/security/signin' }),
    MpxIconsProvider(),
    MpxLocalStorageProvider(),
    MpxMediaProvider(),
    MpxThemingProvider({ scheme: 'system', primary: '#6D28D9', error: '#DC2626', neutral: '#8E8C99' }),
    MpxViewportScrollerProvider(),
    MpxWindowProvider(),
  ],
};
