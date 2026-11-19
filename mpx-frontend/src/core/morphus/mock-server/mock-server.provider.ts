import { HttpBackend } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxMockServer } from './mock-server';
import { MockServerConfig } from './mock-server.model';
import { MpxMockServerBackend } from './mock-server.server';

export const MPX_MOCK_SERVER_CONFIG = new InjectionToken<MockServerConfig>(
  'Mock Server config',
);

export const MpxMockServerProvider = (
  config: MockServerConfig,
): EnvironmentProviders => {
  if (!config.baseURL.startsWith('http')) {
    throw new Error(
      'Mock server baseURL must be an absolute URL (e.g., "https://api.example.com")',
    );
  }

  return makeEnvironmentProviders([
    {
      provide: MPX_MOCK_SERVER_CONFIG,
      useValue: config,
    },
    {
      provide: HttpBackend,
      useClass: MpxMockServerBackend,
    },
    provideAppInitializer(() => {
      inject(MpxMockServer);
    }),
  ]);
};
