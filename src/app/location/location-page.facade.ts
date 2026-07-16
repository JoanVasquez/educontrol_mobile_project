import { Injectable, inject, signal } from '@angular/core';
import type { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import type { GeoPoint, LocationQuality, NearbyPlace, PlaceCategory } from '../core/location/location.model';
import { LocationService } from '../core/location/location.service';
import { LocationShareService } from '../core/location/location-share.service';
import { AutoDismissSignal } from '../core/utils/auto-dismiss-signal.util';

export interface CategoryOption {
  value: PlaceCategory;
  label: string;
}

@Injectable()
export class LocationPageFacade {
  private readonly locationService = inject(LocationService);
  private readonly shareService = inject(LocationShareService);
  private readonly notification = new AutoDismissSignal<string>((message) => this.message.set(message), '');
  private watchSubscription: Subscription | null = null;

  readonly point = signal<GeoPoint | null>(null);
  readonly places = signal<NearbyPlace[]>([]);
  readonly permission = signal<PermissionState | 'unsupported'>('unsupported');
  readonly quality = signal<LocationQuality>('low');
  readonly tracking = signal(false);
  readonly locating = signal(false);
  readonly searching = signal(false);
  readonly placesFromCache = signal(false);
  readonly message = signal('');
  readonly category = signal<PlaceCategory>('all');
  readonly radiusMeters = signal(1_000);

  async initializePermission(): Promise<void> {
    // Consulta el estado inicial para que la pantalla muestre si GPS esta concedido o pendiente.
    this.permission.set(await this.locationService.permissionState());
  }

  async locate(): Promise<void> {
    // Bloquea doble toque mientras el WebView/GPS resuelve la posicion actual.
    if (this.locating()) return;
    this.locating.set(true);
    this.notification.clear();

    try {
      this.updatePoint(await this.locationService.current());
      this.permission.set('granted');
    } catch (error: unknown) {
      this.notification.show(error instanceof Error ? error.message : 'No se pudo obtener la ubicación.');
      await this.initializePermission();
    } finally {
      this.locating.set(false);
    }
  }

  startTracking(): void {
    // El seguimiento queda activo hasta que el usuario lo detenga o el observable falle.
    if (this.tracking()) return;
    this.notification.clear();
    this.tracking.set(true);

    this.watchSubscription = this.locationService.watch().subscribe({
      next: (point) => {
        this.updatePoint(point);
        this.permission.set('granted');
      },
      error: (error: unknown) => {
        this.tracking.set(false);
        this.notification.show(error instanceof Error ? error.message : 'Se perdió el seguimiento de ubicación.');
      },
    });
  }

  stopTracking(): void {
    this.watchSubscription?.unsubscribe();
    this.watchSubscription = null;
    this.tracking.set(false);
    this.notification.dispose();
  }

  async searchNearby(): Promise<void> {
    // Si aun no hay coordenadas, primero intenta obtenerlas antes de consultar lugares.
    const currentPoint = await this.ensurePoint();
    if (!currentPoint || this.searching()) return;

    this.searching.set(true);
    this.notification.clear();

    try {
      const result = await firstValueFrom(
        this.locationService.nearby({
          origin: currentPoint,
          radiusMeters: this.radiusMeters(),
          category: this.category(),
        }),
      );
      this.places.set(result.places);
      // Permite informar cuando la respuesta viene de cache local y no de OpenStreetMap.
      this.placesFromCache.set(result.source === 'cache');
      if (!result.places.length) this.notification.show('No se encontraron lugares con estos filtros.');
    } catch (error: unknown) {
      this.notification.show(error instanceof Error ? error.message : 'No se pudieron buscar lugares cercanos.');
    } finally {
      this.searching.set(false);
    }
  }

  async shareLocation(): Promise<void> {
    const point = this.point();
    if (!point) {
      this.notification.show('Obtén tu ubicación antes de compartirla.');
      return;
    }

    try {
      const result = await this.shareService.share(point);
      this.notification.show(result === 'shared' ? 'Ubicación compartida.' : 'Ubicación copiada al portapapeles.');
    } catch (error: unknown) {
      if ((error as DOMException)?.name !== 'AbortError') this.notification.show('No se pudo compartir la ubicación.');
    }
  }

  mapUrl(point: Pick<GeoPoint, 'latitude' | 'longitude'>): string {
    return this.locationService.mapUrl(point);
  }

  private async ensurePoint(): Promise<GeoPoint | null> {
    if (!this.point()) await this.locate();
    return this.point();
  }

  private updatePoint(point: GeoPoint): void {
    // Mantiene juntos el punto y su calidad para que la UI no calcule reglas de dominio.
    this.point.set(point);
    this.quality.set(this.locationService.quality(point));
  }
}
