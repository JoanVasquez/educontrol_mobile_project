import type { GeoPoint, LocationQuality } from './location.model';

export class LocationAccuracyUtil {
  static quality(accuracy: number): LocationQuality {
    if (accuracy <= 25) return 'high';
    if (accuracy <= 100) return 'medium';
    return 'low';
  }

  static isFresh(point: GeoPoint, maximumAgeMilliseconds = 30_000): boolean {
    return Date.now() - point.timestamp <= maximumAgeMilliseconds;
  }

  static distanceMeters(
    origin: Pick<GeoPoint, 'latitude' | 'longitude'>,
    destination: Pick<GeoPoint, 'latitude' | 'longitude'>,
  ): number {
    const earthRadius = 6_371_000;
    const toRadians = (degrees: number): number => degrees * Math.PI / 180;
    const latitudeDelta = toRadians(destination.latitude - origin.latitude);
    const longitudeDelta = toRadians(destination.longitude - origin.longitude);
    const originLatitude = toRadians(origin.latitude);
    const destinationLatitude = toRadians(destination.latitude);
    const haversine =
      Math.sin(latitudeDelta / 2) ** 2 +
      Math.cos(originLatitude) * Math.cos(destinationLatitude) * Math.sin(longitudeDelta / 2) ** 2;

    return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
  }
}
