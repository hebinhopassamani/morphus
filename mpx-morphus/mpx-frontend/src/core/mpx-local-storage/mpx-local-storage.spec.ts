import {
  PLATFORM_ID,
  provideZonelessChangeDetection,
  TransferState,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WINDOW } from '../mpx-window';
import { MpxLocalStorage } from './mpx-local-storage';

const createStorage = (): Storage => {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  };
};

describe('MpxLocalStorage', () => {
  describe('Server Environment', () => {
    let storage: MpxLocalStorage;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'server' },
          { provide: WINDOW, useValue: null },
        ],
      });

      storage = TestBed.inject(MpxLocalStorage);
    });

    it('should return length of internal storage', () => {
      storage.setItem('item1', 'value');
      storage.setItem('item2', 'another-value');
      storage.setItem('item3', 'some-other-value');

      const length = storage.length;

      expect(length).toBe(3);
    });

    it('should store and retrieve data from internal storage', () => {
      storage.setItem('item', 'test');
      const testData = storage.getItem('item');

      expect(testData).toBe('test');
    });

    it('should remove data from internal storage', () => {
      storage.setItem('item', 'test');
      storage.removeItem('item');
      const testData = storage.getItem('item');

      expect(testData).toBeNull();
    });

    it('should clear internal storage', () => {
      storage.setItem('item1', 'value');
      storage.setItem('item2', 'another-value');
      storage.setItem('item3', 'some-other-value');
      storage.clear();

      expect(storage.length).toBe(0);
    });

    it('should return null for non-existing key', () => {
      const testData = storage.getItem('non-existing-key');

      expect(testData).toBeNull();
    });

    it('should return key by index', () => {
      storage.setItem('item1', 'value');
      storage.setItem('item2', 'another-value');
      storage.setItem('item3', 'some-other-value');

      const key = storage.key(1);

      expect(key).toBe('item2');
    });

    it('should return null for non-existing index', () => {
      const key = storage.key(100);

      expect(key).toBeNull();
    });
  });

  describe('Browser Environment', () => {
    let storage: MpxLocalStorage;
    let window: { MpxLocalStorage: Storage };

    const transferState = {
      get: vi.fn(() => [['testKeyInitial', 'testValueInitial']]),
      set: vi.fn(),
    };

    beforeEach(() => {
      window = { MpxLocalStorage: createStorage() };

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: transferState },
          { provide: WINDOW, useValue: window },
        ],
      });

      storage = TestBed.inject(MpxLocalStorage);
    });

    it('should initialize MpxLocalStorage from transfer state', () => {
      expect(window.MpxLocalStorage.getItem('testKeyInitial')).toBe('testValueInitial');
    });

    it('should not update transfer state in browser when setting item', () => {
      storage.setItem('testKey', 'testValue');
      expect(transferState.set).not.toHaveBeenCalled();
    });

    it('should set item to MpxLocalStorage', () => {
      storage.setItem('testKey', 'testValue');
      expect(window.MpxLocalStorage.getItem('testKey')).toBe('testValue');
    });

    it('should get item from MpxLocalStorage', () => {
      window.MpxLocalStorage.setItem('testKey', 'testValue');
      expect(storage.getItem('testKey')).toBe('testValue');
    });

    it('should remove item from MpxLocalStorage', () => {
      window.MpxLocalStorage.setItem('testKey', 'testValue');
      storage.removeItem('testKey');
      expect(window.MpxLocalStorage.getItem('testKey')).toBeNull();
    });

    it('should clear MpxLocalStorage', () => {
      storage.setItem('testKey1', 'testValue');
      storage.setItem('testKey2', 'anotherValue');
      storage.clear();

      expect(storage.length).toBe(0);
      expect(window.MpxLocalStorage.getItem('testKey1')).toBeNull();
    });

    it('should return the name of the nth key in the list from MpxLocalStorage', () => {
      window.MpxLocalStorage.clear();
      window.MpxLocalStorage.setItem('testKey', 'testValue');
      expect(storage.key(0)).toBe('testKey');
    });

    it('should return length of MpxLocalStorage', () => {
      window.MpxLocalStorage.clear();
      storage.setItem('testKey1', 'testValue');
      storage.setItem('testKey2', 'anotherValue');
      storage.setItem('testKey3', 'someOtherValue');

      expect(storage.length).toBe(3);
    });
  });

  describe('Browser Environment (storage unavailable)', () => {
    let storage: MpxLocalStorage;

    const transferState = {
      get: vi.fn(() => [['testKeyInitial', 'testValueInitial']]),
      set: vi.fn(),
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: transferState },
          { provide: WINDOW, useValue: {} },
        ],
      });

      storage = TestBed.inject(MpxLocalStorage);
    });

    it('should not throw when setting item', () => {
      expect(() => storage.setItem('testKey', 'testValue')).not.toThrow();
    });

    it('should return null for any key', () => {
      storage.setItem('testKey', 'testValue');

      expect(storage.getItem('testKey')).toBeNull();
    });

    it('should not throw when removing item', () => {
      expect(() => storage.removeItem('testKey')).not.toThrow();
    });

    it('should not throw when clearing', () => {
      expect(() => storage.clear()).not.toThrow();
    });

    it('should return null for key index', () => {
      expect(storage.key(0)).toBeNull();
    });

    it('should return zero length', () => {
      storage.setItem('testKey', 'testValue');

      expect(storage.length).toBe(0);
    });
  });

  describe('Browser Environment (storage access denied)', () => {
    const transferState = {
      get: vi.fn(() => [['testKeyInitial', 'testValueInitial']]),
      set: vi.fn(),
    };

    const window = {
      get MpxLocalStorage(): Storage {
        throw new DOMException(
          'Access is denied for this document.',
          'SecurityError'
        );
      },
    };

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: PLATFORM_ID, useValue: 'browser' },
          { provide: TransferState, useValue: transferState },
          { provide: WINDOW, useValue: window },
        ],
      });
    });

    it('should not throw when created', () => {
      expect(() => TestBed.inject(MpxLocalStorage)).not.toThrow();
    });

    it('should not throw when setting item', () => {
      const storage = TestBed.inject(MpxLocalStorage);

      expect(() => storage.setItem('testKey', 'testValue')).not.toThrow();
    });

    it('should return null for any key', () => {
      const storage = TestBed.inject(MpxLocalStorage);
      storage.setItem('testKey', 'testValue');

      expect(storage.getItem('testKey')).toBeNull();
    });

    it('should not throw when removing item', () => {
      const storage = TestBed.inject(MpxLocalStorage);

      expect(() => storage.removeItem('testKey')).not.toThrow();
    });

    it('should not throw when clearing', () => {
      const storage = TestBed.inject(MpxLocalStorage);

      expect(() => storage.clear()).not.toThrow();
    });

    it('should return null for key index', () => {
      const storage = TestBed.inject(MpxLocalStorage);

      expect(storage.key(0)).toBeNull();
    });

    it('should return zero length', () => {
      const storage = TestBed.inject(MpxLocalStorage);
      storage.setItem('testKey', 'testValue');

      expect(storage.length).toBe(0);
    });
  });
});
