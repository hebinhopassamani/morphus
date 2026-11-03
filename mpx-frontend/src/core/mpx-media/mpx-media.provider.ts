import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxMedia } from './mpx.media';

export const provideMpxMedia = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    provideAppInitializer(() => {
      inject(MpxMedia);
    }),
  ]);

export { provideMpxMedia as provideMedia };
