import { ViewportScroller } from '@angular/common';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WINDOW } from '../window';
import { provideViewportScroller } from './provider';
import { BuiScrollViewport } from './scroll-viewport';
import { BuiViewportScroller } from './viewport-scroller';

const createWindow = (scrollY = 0) => ({
  scrollY,
  scrollTo: vi.fn(),
  history: { scrollRestoration: 'auto' },
  document,
});

const createElement = (scrollTop = 0) => {
  const element = document.createElement('div');
  element.scrollTop = scrollTop;
  element.scrollTo = vi.fn();

  return element;
};

describe('BuiViewportScroller', () => {
  let scroller: ViewportScroller;

  const configure = (window: unknown) => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: WINDOW, useValue: window },
        provideViewportScroller(),
      ],
    });

    scroller = TestBed.inject(ViewportScroller);
  };

  describe('Browser Environment', () => {
    let window: ReturnType<typeof createWindow>;

    beforeEach(() => {
      window = createWindow(120);
      configure(window);
    });

    it('should replace the Angular viewport scroller', () => {
      expect(scroller).toBe(TestBed.inject(BuiViewportScroller));
    });

    it('should return the window scroll position', () => {
      expect(scroller.getScrollPosition()).toEqual([0, 120]);
    });

    it('should scroll the window to the position', () => {
      scroller.scrollToPosition([0, 300], { behavior: 'smooth' });

      expect(window.scrollTo).toHaveBeenCalledWith({
        behavior: 'smooth',
        left: 0,
        top: 300,
      });
    });

    it('should scroll the anchor into view and focus it', () => {
      const anchor = document.createElement('section');
      anchor.id = 'anchor';
      anchor.scrollIntoView = vi.fn();
      anchor.focus = vi.fn();
      document.body.appendChild(anchor);

      scroller.scrollToAnchor('anchor', { behavior: 'smooth' });

      expect(anchor.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
      });
      expect(anchor.focus).toHaveBeenCalledWith({ preventScroll: true });

      anchor.remove();
    });

    it('should ignore a missing anchor', () => {
      expect(() => scroller.scrollToAnchor('missing')).not.toThrow();
    });

    it('should set the history scroll restoration', () => {
      scroller.setHistoryScrollRestoration('manual');

      expect(window.history.scrollRestoration).toBe('manual');
    });

    it('should ignore the offset', () => {
      scroller.setOffset([0, 64]);
      scroller.scrollToPosition([0, 300]);

      expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 300 });
    });
  });

  describe('Registered Element', () => {
    let window: ReturnType<typeof createWindow>;
    let element: HTMLElement;

    beforeEach(() => {
      window = createWindow();
      element = createElement(80);
      configure(window);
      TestBed.inject(BuiViewportScroller).element = element;
    });

    it('should return the element scroll position', () => {
      expect(scroller.getScrollPosition()).toEqual([0, 80]);
    });

    it('should scroll both the window and the element', () => {
      scroller.scrollToPosition([0, 300]);

      expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 300 });
      expect(element.scrollTo).toHaveBeenCalledWith({ left: 0, top: 300 });
    });
  });

  describe('Scroll Viewport Directive', () => {
    @Component({
      imports: [BuiScrollViewport],
      template: `<div buiScrollViewport></div>`,
    })
    class TestHost {}

    beforeEach(() => configure(createWindow()));

    it('should register the host element and clear it on destroy', () => {
      const fixture = TestBed.createComponent(TestHost);
      const viewportScroller = TestBed.inject(BuiViewportScroller);

      expect(viewportScroller.element).toBe(
        fixture.nativeElement.querySelector('[buiScrollViewport]')
      );

      fixture.destroy();

      expect(viewportScroller.element).toBeNull();
    });
  });

  describe('Server Environment', () => {
    beforeEach(() => configure(null));

    it('should return the initial scroll position', () => {
      expect(scroller.getScrollPosition()).toEqual([0, 0]);
    });

    it('should not throw when scrolling', () => {
      expect(() => scroller.scrollToPosition([0, 300])).not.toThrow();
      expect(() => scroller.scrollToAnchor('anchor')).not.toThrow();
      expect(() =>
        scroller.setHistoryScrollRestoration('manual')
      ).not.toThrow();
    });
  });

  describe('Server Environment (registered element)', () => {
    beforeEach(() => {
      configure(null);
      // Server DOM elements have no scroll APIs
      TestBed.inject(BuiViewportScroller).element = {} as HTMLElement;
    });

    it('should return the initial scroll position', () => {
      expect(scroller.getScrollPosition()).toEqual([0, 0]);
    });

    it('should not throw when scrolling', () => {
      expect(() => scroller.scrollToPosition([0, 300])).not.toThrow();
    });
  });
});
