import { isPlatformBrowser } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { MpxAuth } from './mpx.auth';

export type AuthOptions = {
  domain?: string;
  clientId?: string;
  callbackPath?: string;
  errorPath?: string;
};

export const provideMpxAuth = (_options?: AuthOptions): EnvironmentProviders =>
  makeEnvironmentProviders([
    MpxAuth,
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
      }
      inject(MpxAuth).loadSessionFromStorage();
    }),
  ]);

export { provideMpxAuth as provideAuth };
