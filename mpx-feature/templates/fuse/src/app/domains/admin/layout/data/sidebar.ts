import { inject, Service, signal } from '@angular/core';
import { LocalStorage } from '@/app/core/local-storage';

const STORAGE_KEY = 'sidebarScheme';

export type SidebarScheme = 'dark' | 'light';

@Service()
export class SidebarService {
  // Dependencies
  private readonly localStorage = inject(LocalStorage);

  // State
  private readonly schemeState = signal(
    (this.localStorage.getItem(STORAGE_KEY) as SidebarScheme) ?? 'dark'
  );
  readonly scheme = this.schemeState.asReadonly();

  setScheme(scheme: SidebarScheme) {
    this.schemeState.set(scheme);
    this.localStorage.setItem(STORAGE_KEY, scheme);
  }
}
