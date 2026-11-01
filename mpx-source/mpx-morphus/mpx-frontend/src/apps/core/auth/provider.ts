import { isPlatformBrowser } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { Auth } from './auth';

export type AuthOptions = {
  domain?: string;
  clientId?: string;
  callbackPath?: string;
  errorPath?: string;
};

export const provideAuth = (_options?: AuthOptions): EnvironmentProviders =>
  makeEnvironmentProviders([
    Auth,
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
      }
      inject(Auth).loadSessionFromStorage();
    }),
  ]);
