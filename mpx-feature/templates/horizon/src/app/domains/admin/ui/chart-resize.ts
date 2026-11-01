import { isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';

@Directive({
  // Must match the third-party chart element
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'apx-chart',
})
export class ChartResize {
  // Dependencies
  private chart = inject(ChartComponent);
  private destroyRef = inject(DestroyRef);
  private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // State
  private frame = 0;
  private height = 0;
  private width = 0;

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    // ApexCharts waits 150ms after the last container resize before it redraws
    // and cancels the pending redraw on every tick, so a chart sized to its
    // container stays frozen for the whole drag. Redraw per frame instead.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => this.resize());
    });

    observer.observe(this.elementRef.nativeElement);

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.frame);
      observer.disconnect();
    });
  }

  private resize(): void {
    const { clientHeight: height, clientWidth: width } =
      this.elementRef.nativeElement;

    if (!width || (width === this.width && height === this.height)) {
      return;
    }

    this.height = height;
    this.width = width;

    // An explicit width also keeps the redraw out of the library's memoization,
    // which drops an update whose options are unchanged. The height follows the
    // container on its own since it is configured as a percentage.
    this.chart.updateOptions({ chart: { width } }, false, false, false);
  }
}
