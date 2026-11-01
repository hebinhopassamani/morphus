import { HttpBackend } from '@angular/common/http';
import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { MockServerBackend } from './backend';
import { MockServer } from './mock-server';
import { MockServerConfig } from './models';

export const MOCK_SERVER_CONFIG = new InjectionToken<MockServerConfig>(
  'Mock Server config'
);

export const provideMockServer = (
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
      useClass: MockServerBackend,
    },

    // Initialize the Mock Server
    provideAppInitializer(() => {
      inject(MockServer);
    }),
  ]);
};
