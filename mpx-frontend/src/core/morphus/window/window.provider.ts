import { isPlatformServer } from '@angular/common';
import {
  DOCUMENT,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  PLATFORM_ID,
} from '@angular/core';

export const MPX_WINDOW = new InjectionToken<Window | null>('MPX_WINDOW');

export const MpxWindowProvider = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: MPX_WINDOW,
      useFactory: () =>
        isPlatformServer(inject(PLATFORM_ID))
          ? null
          : (inject(DOCUMENT).defaultView ?? null),
    },
  ]);
