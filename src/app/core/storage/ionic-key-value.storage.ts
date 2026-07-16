import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { APP_STORAGE_KEY_LIST } from './app-storage.keys';

@Injectable({ providedIn: 'root' })
export class IonicKeyValueStorage {
  private readonly storage = inject(Storage);
  private readonly cache = new Map<string, unknown>();
  private readonly ready = this.initialize();

  getJson<T>(key: string, fallback: T): T {
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }

    const legacyValue = this.readLegacyValue<T>(key);
    if (legacyValue !== null) {
      this.cache.set(key, legacyValue);
      void this.setJson(key, legacyValue);
      this.removeLegacyValue(key);
      return legacyValue;
    }

    return fallback;
  }

  setJson<T>(key: string, value: T): void {
    this.cache.set(key, value);
    void this.ready.then((storage) => storage.set(key, value));
  }

  getString(key: string): string | null {
    const value = this.getJson<string | null>(key, null);
    return typeof value === 'string' ? value : null;
  }

  setString(key: string, value: string): void {
    this.setJson(key, value);
  }

  remove(key: string): void {
    this.cache.delete(key);
    this.removeLegacyValue(key);
    void this.ready.then((storage) => storage.remove(key));
  }

  private async initialize(): Promise<Storage> {
    const storage = await this.storage.create();

    await Promise.all(
      APP_STORAGE_KEY_LIST.map(async (key) => {
        const storedValue = await storage.get(key);
        if (storedValue !== null && storedValue !== undefined) {
          this.cache.set(key, storedValue);
          return;
        }

        const legacyValue = this.readLegacyValue<unknown>(key);
        if (legacyValue !== null) {
          this.cache.set(key, legacyValue);
          await storage.set(key, legacyValue);
          this.removeLegacyValue(key);
        }
      }),
    );

    return storage;
  }

  private readLegacyValue<T>(key: string): T | null {
    if (typeof localStorage === 'undefined') return null;

    const rawValue = localStorage.getItem(key);
    if (!rawValue) return null;

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      return rawValue as T;
    }
  }

  private removeLegacyValue(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  }
}
