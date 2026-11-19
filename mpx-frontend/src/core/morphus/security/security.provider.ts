import { isPlatformBrowser } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  provideAppInitializer,
} from '@angular/core';
import { MpxSecurity } from './security';

export interface MpxSecurityOptions {
  domain?: string;
  clientId?: string;
  callbackPath?: string;
  errorPath?: string;
}

export const MpxSecurityProvider = (_options?: MpxSecurityOptions): EnvironmentProviders =>
  makeEnvironmentProviders([
    MpxSecurity,
    provideAppInitializer(() => {
      if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
      }
      inject(MpxSecurity).loadSessionFromStorage();
    }),
  ]);
