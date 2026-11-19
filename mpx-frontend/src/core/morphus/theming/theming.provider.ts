import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxTheming } from './theming';
import { ThemeConfig } from './theming.model';

export const MPX_THEME_CONFIG = new InjectionToken<ThemeConfig>('MPX_THEME_CONFIG');

export const MpxThemingProvider = (config: ThemeConfig): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: MPX_THEME_CONFIG,
      useValue: config,
    },
    provideAppInitializer(() => {
      inject(MpxTheming);
    }),
  ]);
