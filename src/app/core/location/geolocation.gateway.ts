import { Injectable, NgZone, inject } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';
import type { Observable } from 'rxjs';
import { Observable as RxObservable } from 'rxjs';
import type { GeoPoint } from './location.model';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 5_000,
  timeout: 15_000,
};

@Injectable({ providedIn: 'root' })
export class GeolocationGateway {
  private readonly zone = inject(NgZone);

  async current(): Promise<GeoPoint> {
    await this.ensurePermission();
    return this.toPoint(await Geolocation.getCurrentPosition(GEOLOCATION_OPTIONS));
  }

  watch(): Observable<GeoPoint> {
    return new RxObservable<GeoPoint>((subscriber) => {
      let watchId: string | null = null;
      let cancelled = false;

      void this.ensurePermission()
        .then(() =>
          Geolocation.watchPosition(GEOLOCATION_OPTIONS, (position, error) => {
            this.zone.run(() => {
              if (error) subscriber.error(error);
              else if (position) subscriber.next(this.toPoint(position));
            });
          }),
        )
        .then((id) => {
          watchId = id;
          if (cancelled) void Geolocation.clearWatch({ id });
        })
        .catch((error: unknown) => this.zone.run(() => subscriber.error(error)));

      return () => {
        cancelled = true;
        if (watchId) void Geolocation.clearWatch({ id: watchId });
      };
    });
  }

  async permissionState(): Promise<PermissionState | 'unsupported'> {
    try {
      const permissions = await Geolocation.checkPermissions();
      return this.toPermissionState(permissions.location);
    } catch {
      return 'unsupported';
    }
  }

  private async ensurePermission(): Promise<void> {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location === 'granted') return;

    const requested = await Geolocation.requestPermissions({ permissions: ['location'] });
    if (requested.location !== 'granted') {
      throw { code: 1, message: 'Location permission denied' };
    }
  }

  private toPermissionState(state: string): PermissionState {
    if (state === 'granted') return 'granted';
    if (state === 'denied') return 'denied';
    return 'prompt';
  }

  private toPoint(position: Position): GeoPoint {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp,
    };
  }
}
