import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { BuiViewportScroller } from './viewport-scroller';

@Directive({
  selector: '[buiScrollViewport]',
})
export class BuiScrollViewport {
  // Dependencies
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly viewportScroller = inject(BuiViewportScroller);

  constructor() {
    this.viewportScroller.element = this.elementRef.nativeElement;

    this.destroyRef.onDestroy(() => {
      this.viewportScroller.element = null;
    });
  }
}
