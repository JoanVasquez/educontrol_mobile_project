import { Component, inject } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoYoutube, playCircleOutline } from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { VideoGuideCatalog } from './services/video-guide.catalog';

@Component({
  selector: 'app-video-guide',
  templateUrl: './video-guide.page.html',
  styleUrls: ['./video-guide.page.scss'],
  imports: [IonContent, IonIcon, AppBottomNavigationComponent, AppPageHeaderComponent, VideoPlayerComponent],
})
export class VideoGuidePage {
  private readonly videoGuideCatalog = inject(VideoGuideCatalog);

  readonly guide = this.videoGuideCatalog.getMainGuide();

  constructor() {
    addIcons({ logoYoutube, playCircleOutline });
  }
}
