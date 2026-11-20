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
const MPX_CIPHER_PREFIX = 'mpx1.';
const MPX_STORAGE_SECRET = 'Morphus#One#Enterprise#Vault#2026#MpxKeyStream!9x7Q';

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

    const encrypted = this.encryptValue(key, value);

    if (this.localStorage) {
      this.localStorage.setItem(key, encrypted);
    }

    this.setSharedCookie(key, encrypted);
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

    const sharedDomain = this.getSharedCookieDomain();
    if (sharedDomain) {
      const fromCookie = this.getSharedCookie(key);
      if (fromCookie === null || fromCookie === '__CLEARED__') {
        if (this.localStorage && this.localStorage.getItem(key) !== null) {
          this.localStorage.removeItem(key);
        }
        return null;
      }

      const decrypted = this.decryptValue(key, fromCookie);
      if (decrypted === null) {
        this.removeItem(key);
        return null;
      }

      if (!fromCookie.startsWith(MPX_CIPHER_PREFIX)) {
        this.setItem(key, decrypted);
      } else if (this.localStorage && this.localStorage.getItem(key) !== fromCookie) {
        this.localStorage.setItem(key, fromCookie);
      }
      return decrypted;
    }

    if (this.localStorage) {
      const rawLocal = this.localStorage.getItem(key);
      if (rawLocal === null) {
        return null;
      }
      const decrypted = this.decryptValue(key, rawLocal);
      if (decrypted === null) {
        this.localStorage.removeItem(key);
        return null;
      }
      if (!rawLocal.startsWith(MPX_CIPHER_PREFIX)) {
        this.localStorage.setItem(key, this.encryptValue(key, decrypted));
      }
      return decrypted;
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

  private deriveSeed(input: string, salt: number): number {
    let h = (0x811c9dc5 ^ salt) >>> 0;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  private nextStreamWord(state: { s0: number; s1: number }): number {
    let x = state.s0 >>> 0;
    const y = state.s1 >>> 0;
    state.s0 = y;
    x ^= (x << 23) >>> 0;
    x ^= x >>> 17;
    x ^= y ^ (y >>> 26);
    state.s1 = x >>> 0;
    return (state.s0 + state.s1) >>> 0;
  }

  private computeMacHex(key: string, ivHex: string, cipherBytes: Uint8Array): string {
    const context = `${MPX_STORAGE_SECRET}|${key}|${ivHex}`;
    let h1 = this.deriveSeed(context, 0x9e3779b9);
    let h2 = this.deriveSeed(context, 0x85ebca6b);
    for (let i = 0; i < cipherBytes.length; i++) {
      const b = cipherBytes[i];
      h1 = Math.imul(h1 ^ b, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ ((b + i) & 0xff), 0xc2b2ae35) >>> 0;
    }
    return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
  }

  private toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private fromBase64Url(b64url: string): Uint8Array {
    let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
      b64 += '=';
    }
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  private encryptValue(key: string, plainText: string): string {
    try {
      const randA = Math.floor(Math.random() * 0xffffffff) >>> 0;
      const randB = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
      const ivHex = randA.toString(16).padStart(8, '0') + randB.toString(16).padStart(8, '0');

      const seedMaterial = `${MPX_STORAGE_SECRET}:${key}:${ivHex}`;
      const state = {
        s0: this.deriveSeed(seedMaterial, 0xa5a5a5a5) || 0x13579bdf,
        s1: this.deriveSeed(seedMaterial, 0x5a5a5a5a) || 0x2468ace0,
      };

      const plainBytes = new TextEncoder().encode(plainText);
      const cipherBytes = new Uint8Array(plainBytes.length);
      let word = 0;
      for (let i = 0; i < plainBytes.length; i++) {
        if ((i & 3) === 0) {
          word = this.nextStreamWord(state);
        }
        const mask = (word >>> ((i & 3) * 8)) & 0xff;
        cipherBytes[i] = plainBytes[i] ^ mask;
      }

      const macHex = this.computeMacHex(key, ivHex, cipherBytes);
      const payload = this.toBase64Url(cipherBytes);
      return `${MPX_CIPHER_PREFIX}${ivHex}.${macHex}.${payload}`;
    } catch {
      return plainText;
    }
  }

  private decryptValue(key: string, storedValue: string): string | null {
    if (!storedValue.startsWith(MPX_CIPHER_PREFIX)) {
      return storedValue;
    }
    try {
      const rest = storedValue.substring(MPX_CIPHER_PREFIX.length);
      const parts = rest.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const [ivHex, macHex, payload] = parts;
      if (ivHex.length !== 16 || macHex.length !== 16 || !payload) {
        return null;
      }

      const cipherBytes = this.fromBase64Url(payload);
      const expectedMac = this.computeMacHex(key, ivHex, cipherBytes);
      if (expectedMac !== macHex) {
        return null;
      }

      const seedMaterial = `${MPX_STORAGE_SECRET}:${key}:${ivHex}`;
      const state = {
        s0: this.deriveSeed(seedMaterial, 0xa5a5a5a5) || 0x13579bdf,
        s1: this.deriveSeed(seedMaterial, 0x5a5a5a5a) || 0x2468ace0,
      };

      const plainBytes = new Uint8Array(cipherBytes.length);
      let word = 0;
      for (let i = 0; i < cipherBytes.length; i++) {
        if ((i & 3) === 0) {
          word = this.nextStreamWord(state);
        }
        const mask = (word >>> ((i & 3) * 8)) & 0xff;
        plainBytes[i] = cipherBytes[i] ^ mask;
      }

      return new TextDecoder().decode(plainBytes);
    } catch {
      return null;
    }
  }
}
