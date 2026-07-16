import { Component, computed, inject, signal } from '@angular/core';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filmOutline, playCircleOutline } from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoGuideCatalog, type VideoGuideMedia } from './services/video-guide.catalog';

@Component({
  selector: 'app-video-guide',
  templateUrl: './video-guide.page.html',
  styleUrls: ['./video-guide.page.scss'],
  imports: [IonButton, IonContent, IonIcon, AppBottomNavigationComponent, AppPageHeaderComponent, VideoPlayerComponent],
})
export class VideoGuidePage {
  private readonly videoGuideCatalog = inject(VideoGuideCatalog);

  readonly guide = this.videoGuideCatalog.getMainGuide();
  readonly selectedMediaId = signal(this.guide.mediaItems[0]?.id ?? '');
  readonly selectedMedia = computed<VideoGuideMedia>(() => {
    const selected = this.guide.mediaItems.find((item) => item.id === this.selectedMediaId());

    return selected ?? this.guide.mediaItems[0];
  });

  constructor() {
    addIcons({ filmOutline, playCircleOutline });
  }

  selectMedia(media: VideoGuideMedia): void {
    this.selectedMediaId.set(media.id);
  }
}
