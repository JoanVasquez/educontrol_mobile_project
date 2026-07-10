import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  compassOutline,
  locationOutline,
  navigateOutline,
  refreshOutline,
  shareSocialOutline,
  stopCircleOutline,
} from 'ionicons/icons';
import type { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import type {
  GeoPoint,
  LocationQuality,
  NearbyPlace,
  PlaceCategory,
} from '../core/location/location.model';
import { LocationService } from '../core/location/location.service';
import { LocationShareService } from '../core/location/location-share.service';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

interface CategoryOption {
  value: PlaceCategory;
  label: string;
}

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, DatePipe, IonContent, IonIcon],
})
export class LocationPage implements OnDestroy {
  private readonly locationService = inject(LocationService);
  private readonly shareService = inject(LocationShareService);
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

  readonly categories: CategoryOption[] = [
    { value: 'all', label: 'Todos' },
    { value: 'restaurant', label: 'Restaurantes' },
    { value: 'shop', label: 'Tiendas' },
    { value: 'tourism', label: 'Turismo' },
    { value: 'health', label: 'Salud' },
    { value: 'education', label: 'Educación' },
  ];

  constructor() {
    addIcons({
      compassOutline,
      locationOutline,
      navigateOutline,
      refreshOutline,
      shareSocialOutline,
      stopCircleOutline,
    });
    void this.initializePermission();
  }

  ngOnDestroy(): void {
    this.stopTracking();
  }

  async locate(): Promise<void> {
    if (this.locating()) return;
    this.locating.set(true);
    this.message.set('');

    try {
      this.updatePoint(await this.locationService.current());
      this.permission.set('granted');
    } catch (error: unknown) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo obtener la ubicación.');
      await this.initializePermission();
    } finally {
      this.locating.set(false);
    }
  }

  startTracking(): void {
    if (this.tracking()) return;
    this.message.set('');
    this.tracking.set(true);

    this.watchSubscription = this.locationService.watch().subscribe({
      next: (point) => {
        this.updatePoint(point);
        this.permission.set('granted');
      },
      error: (error: unknown) => {
        this.tracking.set(false);
        this.message.set(error instanceof Error ? error.message : 'Se perdió el seguimiento de ubicación.');
      },
    });
  }

  stopTracking(): void {
    this.watchSubscription?.unsubscribe();
    this.watchSubscription = null;
    this.tracking.set(false);
  }

  setCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as PlaceCategory);
  }

  setRadius(event: Event): void {
    this.radiusMeters.set(Number((event.target as HTMLSelectElement).value));
  }

  async searchNearby(): Promise<void> {
    let currentPoint = this.point();
    if (!currentPoint) {
      await this.locate();
      currentPoint = this.point();
    }
    if (!currentPoint || this.searching()) return;

    this.searching.set(true);
    this.message.set('');

    try {
      const result = await firstValueFrom(
        this.locationService.nearby({
          origin: currentPoint,
          radiusMeters: this.radiusMeters(),
          category: this.category(),
        }),
      );
      this.places.set(result.places);
      this.placesFromCache.set(result.source === 'cache');
      if (!result.places.length) this.message.set('No se encontraron lugares con estos filtros.');
    } catch (error: unknown) {
      this.message.set(error instanceof Error ? error.message : 'No se pudieron buscar lugares cercanos.');
    } finally {
      this.searching.set(false);
    }
  }

  async shareLocation(): Promise<void> {
    const point = this.point();
    if (!point) {
      this.message.set('Obtén tu ubicación antes de compartirla.');
      return;
    }

    try {
      const result = await this.shareService.share(point);
      this.message.set(result === 'shared' ? 'Ubicación compartida.' : 'Ubicación copiada al portapapeles.');
    } catch (error: unknown) {
      if ((error as DOMException)?.name !== 'AbortError') this.message.set('No se pudo compartir la ubicación.');
    }
  }

  openCurrentLocation(): void {
    const point = this.point();
    if (point) window.open(this.locationService.mapUrl(point), '_blank', 'noopener,noreferrer');
  }

  openPlace(place: NearbyPlace): void {
    window.open(this.locationService.mapUrl(place), '_blank', 'noopener,noreferrer');
  }

  qualityLabel(): string {
    if (this.quality() === 'high') return 'Alta';
    if (this.quality() === 'medium') return 'Media';
    return 'Baja';
  }

  categoryLabel(category: NearbyPlace['category']): string {
    return this.categories.find((option) => option.value === category)?.label ?? 'Lugar';
  }

  distanceLabel(distanceMeters: number): string {
    return distanceMeters < 1_000 ? `${distanceMeters} m` : `${(distanceMeters / 1_000).toFixed(1)} km`;
  }

  private async initializePermission(): Promise<void> {
    this.permission.set(await this.locationService.permissionState());
  }

  private updatePoint(point: GeoPoint): void {
    this.point.set(point);
    this.quality.set(this.locationService.quality(point));
  }
}
