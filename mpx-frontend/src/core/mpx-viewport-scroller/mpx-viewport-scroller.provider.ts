import { ViewportScroller } from '@angular/common';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MpxViewportScroller } from './mpx.viewport-scroller';

export const provideMpxViewportScroller = (): EnvironmentProviders =>
  makeEnvironmentProviders([
    // Share the instance the scroll viewport directive registers with
    { provide: ViewportScroller, useExisting: MpxViewportScroller },
  ]);

export { provideMpxViewportScroller as provideViewportScroller };
