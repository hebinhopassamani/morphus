import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxLocalStorage } from './mpx.local-storage';

export const provideMpxLocalStorage = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(MpxLocalStorage);
    }),
  ]);

export { provideMpxLocalStorage as provideLocalStorage };
