import { HttpBackend } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MpxMockServerBackend } from './mpx-mock-server.server';
import { MpxMockServer } from './mpx.mock-server';
import { MockServerConfig } from './mpx-mock-server.model';

export const MOCK_SERVER_CONFIG = new InjectionToken<MockServerConfig>(
  'Mock Server config'
);

export const provideMpxMockServer = (
  config: MockServerConfig
): EnvironmentProviders => {
  if (!config.baseURL.startsWith('http')) {
    throw new Error(
      'Mock server baseURL must be an absolute URL (e.g., "https://api.example.com")'
    );
  }

  return makeEnvironmentProviders([
    {
      provide: MOCK_SERVER_CONFIG,
      useValue: config,
    },
    {
      provide: HttpBackend,
      useClass: MpxMockServerBackend,
    },

    // Initialize the Mock Server
    provideAppInitializer(() => {
      inject(MpxMockServer);
    }),
  ]);
};

export { provideMpxMockServer as provideMockServer };
