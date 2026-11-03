import { EnvironmentProviders, ErrorHandler, makeEnvironmentProviders } from '@angular/core';
import { MorphusErrorHandlerService } from './mpx-error.service';

export function provideError(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ErrorHandler,
      useClass: MorphusErrorHandlerService,
    },
  ]);
}
