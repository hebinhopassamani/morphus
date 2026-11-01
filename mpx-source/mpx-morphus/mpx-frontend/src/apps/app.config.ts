import { provideAuth } from '@/apps/core/auth';
import { provideIcons } from '@/apps/core/icons';
import { provideLocalStorage } from '@/apps/core/local-storage';
import { provideMedia } from '@/apps/core/media';
import { provideMockServer } from '@/apps/core/mock-server';
import { provideTheming } from '@/apps/core/theming';
import { provideViewportScroller } from '@/apps/core/viewport-scroller';
import { provideWindow } from '@/apps/core/window';
import { environment } from '@/environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_PROGRESS_SPINNER_DEFAULT_OPTIONS } from '@angular/material/progress-spinner';
import { MAT_TABS_CONFIG } from '@angular/material/tabs';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withInMemoryScrolling, withPreloading } from '@angular/router';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), withPreloading(PreloadAllModules)),
    provideClientHydration(withEventReplay()),

    // 🧙‍♂️ AJUSTE AQUI: Cliente HTTP ativado com o seu interceptor e SEM o withFetch() depreciado
    provideHttpClient(withInterceptors([authInterceptor])),

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
