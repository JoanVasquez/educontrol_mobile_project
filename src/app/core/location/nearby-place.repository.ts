import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, retry, throwError, timeout } from 'rxjs';
import type { NearbyPlace, NearbySearch, PlaceCategory } from './location.model';
import { NearbyPlaceMapper } from './nearby-place.mapper';
import type { OverpassElement } from './nearby-place.mapper';

interface OverpassResponse {
  elements?: OverpassElement[];
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

@Injectable({ providedIn: 'root' })
export class NearbyPlaceRepository {
  private readonly http = inject(HttpClient);
  private readonly mapper = new NearbyPlaceMapper();

  search(search: NearbySearch): Observable<NearbyPlace[]> {
    return this.request(0, search);
  }

  private request(endpointIndex: number, search: NearbySearch): Observable<NearbyPlace[]> {
    const body = `data=${encodeURIComponent(this.query(search))}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<OverpassResponse>(OVERPASS_ENDPOINTS[endpointIndex], body, { headers }).pipe(
      timeout(18_000),
      retry({ count: 1, delay: 1_000 }),
      map((response) =>
        (response.elements ?? [])
          .map((element) => this.mapper.fromElement(element, search.origin))
          .filter((place): place is NearbyPlace => Boolean(place))
          .sort((first, second) => first.distanceMeters - second.distanceMeters)
          .slice(0, 40),
      ),
      catchError((error: unknown) =>
        endpointIndex + 1 < OVERPASS_ENDPOINTS.length
          ? this.request(endpointIndex + 1, search)
          : throwError(() => error),
      ),
    );
  }

  private query(search: NearbySearch): string {
    const around = `around:${search.radiusMeters},${search.origin.latitude},${search.origin.longitude}`;
    const statements = this.filters(search.category).reduce<string[]>((result, filter) => {
      result.push(
        `node(${around})${filter};`,
        `way(${around})${filter};`,
        `relation(${around})${filter};`,
      );
      return result;
    }, []);

    return `[out:json][timeout:15];(${statements.join('')});out center tags;`;
  }

  private filters(category: PlaceCategory): string[] {
    const categories: Record<Exclude<PlaceCategory, 'all'>, string[]> = {
      restaurant: ['["amenity"~"restaurant|cafe|fast_food"]'],
      shop: ['["shop"]'],
      tourism: ['["tourism"]', '["historic"]'],
      health: ['["amenity"~"hospital|clinic|pharmacy"]'],
      education: ['["amenity"~"school|college|university"]'],
    };

    if (category !== 'all') return categories[category];

    return Object.keys(categories).reduce<string[]>((result, key) => {
      return result.concat(categories[key as Exclude<PlaceCategory, 'all'>]);
    }, []);
  }
}
