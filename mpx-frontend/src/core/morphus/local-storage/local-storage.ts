import { isPlatformServer } from '@angular/common';
import {
  inject,
  makeStateKey,
  PLATFORM_ID,
  Injectable,
  TransferState,
} from '@angular/core';
import { MPX_WINDOW } from '../window/window.provider';

const STORAGE_STATE_KEY = makeStateKey<[string, string][]>('APP_STORAGE_STATE');

@Injectable({
  providedIn: 'root',
})
export class MpxLocalStorage {
  // Dependencies
  private transferState = inject(TransferState);
  private window = inject(MPX_WINDOW);

  // State
  private isServer = isPlatformServer(inject(PLATFORM_ID));
  private storage = new Map<string, string>();

  constructor() {
    // Restore the localStorage from the transfer state in the browser
    if (!this.isServer) {
      new Map(this.transferState.get(STORAGE_STATE_KEY, [])).forEach(
        (value, key) => {
          this.setItem(key, value);
        }
      );
    }
  }

  /**
   * Returns the browser's localStorage, or null when it is unavailable.
   */
  private get localStorage(): Storage | null {
    // Browsers throw on access when storage is denied
    try {
      return this.window?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Updates the transfer state with the given map.
   */
  private updateTransferState(map: Map<string, string>) {
    this.transferState.set(STORAGE_STATE_KEY, Array.from(map.entries()));
  }

  /**
   * Returns the number of key/value pairs.
   */
  get length(): number {
    if (this.isServer) {
      return this.storage.size;
    }

    if (this.localStorage) {
      return this.localStorage.length;
    }

    return 0;
  }

  /**
   * Sets the value of the pair identified by key to value,
   * creating a new key/value pair if none existed for key previously.
   */
  setItem(key: string, value: string): void {
    if (this.isServer) {
      this.storage.set(key, value);
      this.updateTransferState(this.storage);
      return;
    }

    if (this.localStorage) {
      this.localStorage.setItem(key, value);
    }

    this.setSharedCookie(key, value);
  }

  /**
   * Returns the current value associated with the given key,
   * or null if the given key does not exist in the list associated
   * with the object.
   */
  getItem(key: string): string | null {
    if (this.isServer) {
      return this.storage.get(key) ?? null;
    }

    const fromCookie = this.getSharedCookie(key);
    if (fromCookie === '__CLEARED__') {
      if (this.localStorage && this.localStorage.getItem(key) !== null) {
        this.localStorage.removeItem(key);
      }
      return null;
    }
    if (fromCookie !== null) {
      if (this.localStorage && this.localStorage.getItem(key) !== fromCookie) {
        this.localStorage.setItem(key, fromCookie);
      }
      return fromCookie;
    }

    if (this.localStorage) {
      const localVal = this.localStorage.getItem(key);
      if (localVal !== null) {
        this.setSharedCookie(key, localVal);
      }
      return localVal;
    }

    return null;
  }

  /**
   * Removes the key/value pair with the given key,
   * if a key/value pair with the given key exists.
   */
  removeItem(key: string): void {
    if (this.isServer) {
      this.storage.delete(key);
      this.updateTransferState(this.storage);
      return;
    }

    if (this.localStorage) {
      this.localStorage.removeItem(key);
    }

    this.removeSharedCookie(key);
  }

  private getSharedCookieDomain(): string | null {
    const host = this.window?.location?.hostname?.toLowerCase() ?? '';
    if (host === 'morphus.one' || host.endsWith('.morphus.one')) {
      return '.morphus.one';
    }
    return null;
  }

  private setSharedCookie(key: string, value: string): void {
    try {
      const domain = this.getSharedCookieDomain();
      if (!domain || !this.window?.document) {
        return;
      }
      const baseKey = encodeURIComponent(`mpx_sso_${key}`);
      const encodedVal = encodeURIComponent(value);
      const chunkSize = 2800;

      if (encodedVal.length <= chunkSize) {
        this.window.document.cookie = `${baseKey}=${encodedVal}; Domain=${domain}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
        return;
      }

      const chunksCount = Math.ceil(encodedVal.length / chunkSize);
      if (chunksCount > 8) {
        return;
      }
      this.window.document.cookie = `${baseKey}=__CHUNKED__:${chunksCount}; Domain=${domain}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
      for (let i = 0; i < chunksCount; i++) {
        const chunk = encodedVal.substring(i * chunkSize, (i + 1) * chunkSize);
        this.window.document.cookie = `${baseKey}__${i}=${chunk}; Domain=${domain}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
      }
    } catch {
      // Ignore cookie write errors
    }
  }

  private getRawCookieValue(cookieName: string): string | null {
    if (!this.window?.document?.cookie) {
      return null;
    }
    const targetName = `${cookieName}=`;
    const parts = this.window.document.cookie.split(';');
    for (const raw of parts) {
      const part = raw.trim();
      if (part.startsWith(targetName)) {
        return part.substring(targetName.length);
      }
    }
    return null;
  }

  private getSharedCookie(key: string): string | null {
    try {
      const domain = this.getSharedCookieDomain();
      if (!domain || !this.window?.document?.cookie) {
        return null;
      }
      const baseKey = encodeURIComponent(`mpx_sso_${key}`);
      const mainVal = this.getRawCookieValue(baseKey);
      if (mainVal === null) {
        return null;
      }
      if (mainVal.startsWith('__CHUNKED__:')) {
        const count = parseInt(mainVal.substring('__CHUNKED__:'.length), 10);
        if (!count || Number.isNaN(count)) {
          return null;
        }
        let combined = '';
        for (let i = 0; i < count; i++) {
          const chunk = this.getRawCookieValue(`${baseKey}__${i}`);
          if (chunk === null) {
            return null;
          }
          combined += chunk;
        }
        return decodeURIComponent(combined);
      }
      return decodeURIComponent(mainVal);
    } catch {
      return null;
    }
  }

  private removeSharedCookie(key: string): void {
    try {
      const domain = this.getSharedCookieDomain();
      if (!domain || !this.window?.document) {
        return;
      }
      const baseKey = encodeURIComponent(`mpx_sso_${key}`);
      this.window.document.cookie = `${baseKey}=__CLEARED__; Domain=${domain}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`;
      for (let i = 0; i < 8; i++) {
        this.window.document.cookie = `${baseKey}__${i}=; Domain=${domain}; Path=/; Max-Age=0; SameSite=Lax; Secure`;
      }
    } catch {
      // Ignore cookie delete errors
    }
  }

  /**
   * Removes all key/value pairs, if there are any.
   */
  clear(): void {
    if (this.isServer) {
      this.storage.clear();
      this.updateTransferState(this.storage);
      return;
    }

    if (this.localStorage) {
      this.localStorage.clear();
    }
  }

  /**
   * Returns the name of the nth key in the list.
   */
  key(index: number): string | null {
    if (this.isServer) {
      return Array.from(this.storage.keys())[index] ?? null;
    }

    if (this.localStorage) {
      return this.localStorage.key(index);
    }

    return null;
  }
}
