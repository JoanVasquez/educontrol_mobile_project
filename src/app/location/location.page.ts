import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import type { NearbyPlace, PlaceCategory } from '../core/location/location.model';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { LocationPageFacade, type CategoryOption } from './location-page.facade';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, DatePipe, IonContent, IonIcon],
  providers: [LocationPageFacade],
})
export class LocationPage implements OnDestroy {
  private readonly facade = inject(LocationPageFacade);

  readonly point = this.facade.point;
  readonly places = this.facade.places;
  readonly permission = this.facade.permission;
  readonly quality = this.facade.quality;
  readonly tracking = this.facade.tracking;
  readonly locating = this.facade.locating;
  readonly searching = this.facade.searching;
  readonly placesFromCache = this.facade.placesFromCache;
  readonly message = this.facade.message;
  readonly category = this.facade.category;
  readonly radiusMeters = this.facade.radiusMeters;

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
    void this.facade.initializePermission();
  }

  ngOnDestroy(): void {
    this.facade.stopTracking();
  }

  async locate(): Promise<void> {
    await this.facade.locate();
  }

  startTracking(): void {
    this.facade.startTracking();
  }

  stopTracking(): void {
    this.facade.stopTracking();
  }

  setCategory(event: Event): void {
    this.category.set((event.target as HTMLSelectElement).value as PlaceCategory);
  }

  setRadius(event: Event): void {
    this.radiusMeters.set(Number((event.target as HTMLSelectElement).value));
  }

  async searchNearby(): Promise<void> {
    await this.facade.searchNearby();
  }

  async shareLocation(): Promise<void> {
    await this.facade.shareLocation();
  }

  openCurrentLocation(): void {
    const point = this.point();
    if (point) window.open(this.facade.mapUrl(point), '_blank', 'noopener,noreferrer');
  }

  openPlace(place: NearbyPlace): void {
    window.open(this.facade.mapUrl(place), '_blank', 'noopener,noreferrer');
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
}
