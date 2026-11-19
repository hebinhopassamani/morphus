import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxMedia } from './media';

export const MpxMediaProvider = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(MpxMedia);
    }),
  ]);
