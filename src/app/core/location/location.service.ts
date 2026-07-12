import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of, tap, throwError } from 'rxjs';
import { NetworkService } from '../../detector_red/network.service';
import { GeolocationGateway } from './geolocation.gateway';
import { LocationAccuracyUtil } from './location-accuracy.util';
import { LocationErrorMapper } from './location-error.mapper';
import type { GeoPoint, LocationQuality, NearbyPlace, NearbySearch } from './location.model';
import { NearbyPlaceCacheRepository } from './nearby-place-cache.repository';
import { NearbyPlaceRepository } from './nearby-place.repository';

export interface NearbyPlaceResult {
  places: NearbyPlace[];
  source: 'remote' | 'cache';
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly geolocation = inject(GeolocationGateway);
  private readonly placesRepository = inject(NearbyPlaceRepository);
  private readonly cacheRepository = inject(NearbyPlaceCacheRepository);
  private readonly network = inject(NetworkService);

  current(): Promise<GeoPoint> {
    // Normaliza errores nativos del GPS a mensajes entendibles para la UI.
    return this.geolocation.current().catch((error: unknown) => {
      throw new Error(LocationErrorMapper.message(error));
    });
  }

  watch(): Observable<GeoPoint> {
    return this.geolocation.watch().pipe(
      catchError((error: unknown) => throwError(() => new Error(LocationErrorMapper.message(error)))),
    );
  }

  permissionState(): Promise<PermissionState | 'unsupported'> {
    return this.geolocation.permissionState();
  }

  quality(point: GeoPoint): LocationQuality {
    return LocationAccuracyUtil.quality(point.accuracy);
  }

  isFresh(point: GeoPoint): boolean {
    return LocationAccuracyUtil.isFresh(point);
  }

  nearby(search: NearbySearch): Observable<NearbyPlaceResult> {
    const cached = this.cacheRepository.find(search);
    if (!this.network.isOnline) {
      // Si no hay red, solo se muestran lugares guardados previamente para esa busqueda.
      return cached.length
        ? of({ places: cached, source: 'cache' })
        : throwError(() => new Error('No hay conexión ni lugares cercanos guardados.'));
    }

    return this.placesRepository.search(search).pipe(
      // OpenStreetMap es la fuente remota; la respuesta se guarda para uso offline.
      tap((places) => this.cacheRepository.save(search, places)),
      map((places) => ({ places, source: 'remote' as const })),
      catchError(() =>
        cached.length
          ? of({ places: cached, source: 'cache' as const })
          : throwError(() => new Error('No se pudo consultar OpenStreetMap. Intenta nuevamente.')),
      ),
    );
  }

  mapUrl(point: Pick<GeoPoint, 'latitude' | 'longitude'>): string {
    return `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=18/${point.latitude}/${point.longitude}`;
  }
}
