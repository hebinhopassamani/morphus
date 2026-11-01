import { ViewportScroller } from '@angular/common';
import { inject, Service } from '@angular/core';
import { WINDOW } from '../window';

@Service()
export class BuiViewportScroller implements ViewportScroller {
  // Dependencies
  private window = inject(WINDOW);

  // State
  element: HTMLElement | null = null;

  /**
   * Has no effect, anchor offsets come from the CSS scroll margin of the anchor.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setOffset(): void {}

  /**
   * Returns the scroll position of the registered element or the window.
   */
  getScrollPosition(): [number, number] {
    return [0, this.element?.scrollTop || this.window?.scrollY || 0];
  }

  /**
   * Scrolls both the window and the registered element, only one of them scrolls.
   */
  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    const scrollOptions = { ...options, left: position[0], top: position[1] };
    this.window?.scrollTo(scrollOptions);
    this.element?.scrollTo?.(scrollOptions);
  }

  /**
   * Scrolls to the element with the given id and focuses it.
   */
  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    const element = this.window?.document.getElementById(anchor);
    element?.scrollIntoView(options);
    element?.focus({ preventScroll: true });
  }

  /**
   * Sets the scroll restoration behavior of the browser history.
   */
  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    if (this.window) {
      this.window.history.scrollRestoration = scrollRestoration;
    }
  }
}
