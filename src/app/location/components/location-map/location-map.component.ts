import type { OnChanges, OnDestroy} from '@angular/core';
import { Component, DestroyRef, Input, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Subscription } from 'rxjs';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, mapOutline } from 'ionicons/icons';
import { LocationMapTileService } from '../../../core/location/location-map-tile.service';
import type { LocationMapPoint, LocationMapTile } from '../../../core/location/location-map-tile.service';

@Component({
  selector: 'app-location-map',
  imports: [IonIcon],
  templateUrl: './location-map.component.html',
  styleUrls: ['./location-map.component.scss'],
})
export class LocationMapComponent implements OnChanges, OnDestroy {
  private readonly tileService = inject(LocationMapTileService);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ required: true }) point: LocationMapPoint | null = null;
  @Input() title = 'Mapa de ubicación';

  readonly tiles = signal<LocationMapTile[]>([]);
  readonly loading = signal(false);
  readonly failed = signal(false);
  private tileSubscription: Subscription | null = null;

  constructor() {
    addIcons({ locationOutline, mapOutline });
  }

  ngOnChanges(): void {
    this.tileSubscription?.unsubscribe();
    this.releaseObjectUrls();
    this.failed.set(false);

    if (!this.point) {
      this.tiles.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.tileSubscription = this.tileService
      .loadTiles(this.point)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tiles) => {
          this.tiles.set(tiles);
          this.loading.set(false);
        },
        error: () => {
          this.tiles.set([]);
          this.loading.set(false);
          this.failed.set(true);
        },
      });
  }

  ngOnDestroy(): void {
    this.tileSubscription?.unsubscribe();
    this.releaseObjectUrls();
  }

  private releaseObjectUrls(): void {
    for (const tile of this.tiles()) {
      if (tile.isObjectUrl) URL.revokeObjectURL(tile.imageUrl);
    }
  }
}
