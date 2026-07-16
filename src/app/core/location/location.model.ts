export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export type LocationQuality = 'high' | 'medium' | 'low';

export type PlaceCategory = 'all' | 'restaurant' | 'shop' | 'tourism' | 'health' | 'education';

export interface NearbyPlace {
  id: string;
  name: string;
  category: Exclude<PlaceCategory, 'all'> | 'other';
  typeLabel: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string;
}

export interface NearbySearch {
  origin: GeoPoint;
  radiusMeters: number;
  category: PlaceCategory;
}
