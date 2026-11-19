import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxLocalStorage } from './local-storage';

export const MpxLocalStorageProvider = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(MpxLocalStorage);
    }),
  ]);
