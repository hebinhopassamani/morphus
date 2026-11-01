import { inject, Service, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorage } from '@/app/core/local-storage';

const STORAGE_KEY = 'favorites';

export type Favorite = {
  url: string;
  label: string;
  icon?: string;
};

@Service()
export class FavoritesService {
  // Dependencies
  private readonly localStorage = inject(LocalStorage);
  private readonly router = inject(Router);

  // State
  private readonly items = signal<Favorite[]>(this.restoreFavorites());
  readonly favorites = this.items.asReadonly();

  /**
   * Reads the stored favorites.
   */
  private restoreFavorites(): Favorite[] {
    const stored = this.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored) as Favorite[];
    } catch {
      return [];
    }
  }

  /**
   * Drops the query params and fragment so favorites are page wide.
   */
  private toPath(url: string): string {
    const tree = this.router.parseUrl(url);
    tree.queryParams = {};
    tree.fragment = null;

    return this.router.serializeUrl(tree);
  }

  isFavorite(url: string) {
    const path = this.toPath(url);

    return this.items().some((item) => this.toPath(item.url) === path);
  }

  toggleFavorite(favorite: Favorite) {
    const path = this.toPath(favorite.url);

    this.items.update((items) =>
      items.some((item) => this.toPath(item.url) === path)
        ? items.filter((item) => this.toPath(item.url) !== path)
        : [...items, { ...favorite, url: path }]
    );

    this.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }
}
