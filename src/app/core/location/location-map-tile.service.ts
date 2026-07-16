import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import type { Observable } from 'rxjs';

export interface LocationMapPoint {
  latitude: number;
  longitude: number;
}

export interface LocationMapTile {
  readonly key: string;
  readonly imageUrl: string;
  readonly isObjectUrl: boolean;
}

@Injectable({ providedIn: 'root' })
export class LocationMapTileService {
  private static readonly tileSize = 256;
  private static readonly zoom = 16;

  private readonly http = inject(HttpClient);

  loadTiles(point: LocationMapPoint): Observable<LocationMapTile[]> {
    const center = this.toTile(point, LocationMapTileService.zoom);
    const offsets = [-1, 0, 1];
    const requests: Observable<LocationMapTile>[] = [];

    for (const yOffset of offsets) {
      for (const xOffset of offsets) {
        requests.push(this.loadTile(center.x + xOffset, center.y + yOffset, LocationMapTileService.zoom));
      }
    }

    return forkJoin(requests);
  }

  private loadTile(x: number, y: number, zoom: number): Observable<LocationMapTile> {
    const url = `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
    const key = `${zoom}-${x}-${y}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((blob) => ({
        key,
        imageUrl: URL.createObjectURL(blob),
        isObjectUrl: true,
      })),
      catchError(() =>
        of({
          key,
          imageUrl: url,
          isObjectUrl: false,
        }),
      ),
    );
  }

  private toTile(point: LocationMapPoint, zoom: number): { x: number; y: number } {
    const scale = 2 ** zoom;
    const latitudeRad = (point.latitude * Math.PI) / 180;

    return {
      x: Math.floor(((point.longitude + 180) / 360) * scale),
      y: Math.floor(((1 - Math.log(Math.tan(latitudeRad) + 1 / Math.cos(latitudeRad)) / Math.PI) / 2) * scale),
    };
  }
}
