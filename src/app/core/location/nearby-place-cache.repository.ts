import { Injectable } from '@angular/core';
import type { NearbyPlace, NearbySearch } from './location.model';

interface CachedPlaces {
  savedAt: number;
  search: NearbySearch;
  places: NearbyPlace[];
}

const CACHE_KEY = 'educontrol.cache.nearby-places';

@Injectable({ providedIn: 'root' })
export class NearbyPlaceCacheRepository {
  save(search: NearbySearch, places: NearbyPlace[]): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), search, places }));
  }

  find(search: NearbySearch): NearbyPlace[] {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];

    try {
      const cached = JSON.parse(raw) as CachedPlaces;
      const age = Date.now() - cached.savedAt;
      const distance = LocationDistance.between(search.origin, cached.search.origin);
      const compatible =
        age <= 15 * 60_000 &&
        distance <= 500 &&
        cached.search.category === search.category &&
        cached.search.radiusMeters === search.radiusMeters;

      return compatible ? cached.places : [];
    } catch {
      localStorage.removeItem(CACHE_KEY);
      return [];
    }
  }
}

class LocationDistance {
  static between(first: NearbySearch['origin'], second: NearbySearch['origin']): number {
    const latitude = (first.latitude - second.latitude) * 111_320;
    const longitude =
      (first.longitude - second.longitude) *
      111_320 *
      Math.cos(first.latitude * Math.PI / 180);
    return Math.sqrt(latitude ** 2 + longitude ** 2);
  }
}
