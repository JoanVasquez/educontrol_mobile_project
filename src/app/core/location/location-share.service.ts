import { Injectable } from '@angular/core';
import type { GeoPoint } from './location.model';

@Injectable({ providedIn: 'root' })
export class LocationShareService {
  async share(point: GeoPoint): Promise<'shared' | 'copied'> {
    const url = `https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=18/${point.latitude}/${point.longitude}`;
    const text = `Mi ubicación actual (precisión aproximada: ${Math.round(point.accuracy)} m): ${url}`;

    if (navigator.share) {
      await navigator.share({ title: 'Mi ubicación', text, url });
      return 'shared';
    }

    await navigator.clipboard.writeText(text);
    return 'copied';
  }
}
