import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { ThemeConfig } from './mpx-theming.model';
import { MpxTheming } from './mpx.theming';

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG');

export const provideMpxTheming = (config: ThemeConfig): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: THEME_CONFIG,
      useValue: config,
    },

    // Initialize the MpxTheming
    provideAppInitializer(() => {
      inject(MpxTheming);
    }),
  ]);

export { provideMpxTheming as provideTheming };
