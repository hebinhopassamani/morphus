import { ViewportScroller } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { BuiViewportScroller } from './viewport-scroller';

export const provideViewportScroller = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    // Share the instance the scroll viewport directive registers with
    { provide: ViewportScroller, useExisting: BuiViewportScroller },
  ]);
