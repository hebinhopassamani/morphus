import { MediaMatcher } from '@angular/cdk/layout';
import {
  DestroyRef,
  EnvironmentInjector,
  PLATFORM_ID,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MpxMedia } from './mpx-MpxMedia';

type ChangeListener = (event: MediaQueryListEvent) => void;

const createMediaQueryList = (query: string, matches = false) => ({
  matches,
  MpxMedia: query,
  addEventListener: vi.fn<(type: string, listener: ChangeListener) => void>(),
  removeEventListener:
    vi.fn<(type: string, listener: ChangeListener) => void>(),
});

const createMediaMatcher = () => {
  const lists = new Map<string, ReturnType<typeof createMediaQueryList>>();

  return {
    lists,
    matchMedia: vi.fn((query: string) => {
      const list = lists.get(query) ?? createMediaQueryList(query);
      lists.set(query, list);

      return list;
    }),
  };
};

const changeListenerOf = (
  list: ReturnType<typeof createMediaQueryList>
): ChangeListener => list.addEventListener.mock.calls[0][1];

describe('MpxMedia', () => {
  let MpxMedia: MpxMedia;
  let mediaMatcher: ReturnType<typeof createMediaMatcher>;
  let destroyCallbacks: (() => void)[];

  const configure = (platform: string) => {
    mediaMatcher = createMediaMatcher();
    destroyCallbacks = [];

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: MediaMatcher, useValue: mediaMatcher },
      ],
    });

    // Store the destroy callbacks so we can call them later
    vi.spyOn(
      TestBed.inject(EnvironmentInjector).get(DestroyRef),
      'onDestroy'
    ).mockImplementation((callback) => {
      destroyCallbacks.push(callback);
      return () => void 0;
    });

    MpxMedia = TestBed.inject(MpxMedia);
  };

  describe('Browser Environment', () => {
    beforeEach(() => configure('browser'));

    it('should create one MpxMedia query list per query', () => {
      const first = MpxMedia.match('(prefers-color-scheme: dark)');
      const second = MpxMedia.match('(prefers-color-scheme: dark)');

      expect(mediaMatcher.matchMedia).toHaveBeenCalledTimes(1);
      expect(second()).toBe(first());
    });

    it('should seed the signal from the initial matches value', () => {
      const query = '(min-width: 768px)';
      mediaMatcher.lists.set(query, createMediaQueryList(query, true));

      expect(MpxMedia.match(query)()).toBe(true);
    });

    it('should add a change listener', () => {
      const query = '(prefers-color-scheme: dark)';
      MpxMedia.match(query);

      expect(
        mediaMatcher.lists.get(query)!.addEventListener
      ).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update the signal when the MpxMedia query changes', () => {
      const query = '(min-width: 768px)';
      const matches = MpxMedia.match(query);
      const listener = changeListenerOf(mediaMatcher.lists.get(query)!);

      listener({ matches: true } as MediaQueryListEvent);
      expect(matches()).toBe(true);

      listener({ matches: false } as MediaQueryListEvent);
      expect(matches()).toBe(false);
    });

    it('should track each query independently', () => {
      const wide = MpxMedia.match('(min-width: 768px)');
      const dark = MpxMedia.match('(prefers-color-scheme: dark)');

      changeListenerOf(mediaMatcher.lists.get('(min-width: 768px)')!)({
        matches: true,
      } as MediaQueryListEvent);

      expect(wide()).toBe(true);
      expect(dark()).toBe(false);
    });

    it('should remove the change listener on destroy', () => {
      const query = '(prefers-color-scheme: dark)';
      MpxMedia.match(query);

      const list = mediaMatcher.lists.get(query)!;
      destroyCallbacks.forEach((callback) => callback());

      expect(list.removeEventListener).toHaveBeenCalledWith(
        'change',
        changeListenerOf(list)
      );
    });
  });

  describe('Server Environment', () => {
    beforeEach(() => configure('server'));

    it('should seed the signal from the initial matches value', () => {
      const query = '(min-width: 768px)';
      mediaMatcher.lists.set(query, createMediaQueryList(query, true));

      expect(MpxMedia.match(query)()).toBe(true);
    });

    it('should not add a change listener', () => {
      const query = '(prefers-color-scheme: dark)';
      MpxMedia.match(query);

      expect(
        mediaMatcher.lists.get(query)!.addEventListener
      ).not.toHaveBeenCalled();
    });

    it('should not register destroy cleanup', () => {
      MpxMedia.match('(prefers-color-scheme: dark)');

      expect(destroyCallbacks).toHaveLength(0);
    });
  });
});
