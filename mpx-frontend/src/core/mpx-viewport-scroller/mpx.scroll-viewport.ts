import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { MpxViewportScroller } from './mpx.viewport-scroller';

@Directive({
  selector: '[mpxScrollViewport], [MpxScrollViewport]',
})
export class MpxScrollViewport {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewportScroller = inject(MpxViewportScroller);

  constructor() {
    this.viewportScroller.element = this.elementRef.nativeElement;

    this.destroyRef.onDestroy(() => {
      this.viewportScroller.element = null;
    });
  }
}
