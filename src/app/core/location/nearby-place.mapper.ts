import { LocationAccuracyUtil } from './location-accuracy.util';
import type { GeoPoint, NearbyPlace } from './location.model';

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export class NearbyPlaceMapper {
  fromElement(element: OverpassElement, origin: GeoPoint): NearbyPlace | null {
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (latitude === undefined || longitude === undefined) return null;

    const tags = element.tags ?? {};
    return {
      id: `${element.type}-${element.id}`,
      name: tags['name'] || tags['brand'] || this.fallbackName(tags),
      category: this.category(tags),
      latitude,
      longitude,
      distanceMeters: LocationAccuracyUtil.distanceMeters(origin, { latitude, longitude }),
      address: this.address(tags),
    };
  }

  private category(tags: Record<string, string>): NearbyPlace['category'] {
    if (tags['amenity'] === 'restaurant' || tags['amenity'] === 'cafe' || tags['amenity'] === 'fast_food') {
      return 'restaurant';
    }
    if (tags['shop']) return 'shop';
    if (tags['tourism'] || tags['historic']) return 'tourism';
    if (tags['amenity'] === 'hospital' || tags['amenity'] === 'clinic' || tags['amenity'] === 'pharmacy') {
      return 'health';
    }
    if (tags['amenity'] === 'school' || tags['amenity'] === 'college' || tags['amenity'] === 'university') {
      return 'education';
    }
    return 'other';
  }

  private fallbackName(tags: Record<string, string>): string {
    return tags['amenity'] || tags['shop'] || tags['tourism'] || 'Lugar cercano';
  }

  private address(tags: Record<string, string>): string {
    return [
      tags['addr:street'],
      tags['addr:housenumber'],
      tags['addr:city'],
    ].filter(Boolean).join(' ') || 'Dirección no disponible';
  }
}
