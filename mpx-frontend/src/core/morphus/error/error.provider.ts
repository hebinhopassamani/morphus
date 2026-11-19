import { EnvironmentProviders, ErrorHandler, makeEnvironmentProviders } from '@angular/core';
import { MpxErrorHandlerService } from './error.service';

export const MpxErrorProvider = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    {
      provide: ErrorHandler,
      useClass: MpxErrorHandlerService,
    },
  ]);
