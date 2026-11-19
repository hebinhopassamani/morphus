import { ViewportScroller } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MpxViewportScroller } from './viewport-scroller';

export const MpxViewportScrollerProvider = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: ViewportScroller, useExisting: MpxViewportScroller },
  ]);
