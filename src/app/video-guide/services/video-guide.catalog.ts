import { Injectable } from '@angular/core';
import { buildYouTubeVideoDescriptor, type YouTubeVideoDescriptor } from '../../core/media/youtube-video.util';

export interface VideoGuide {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly video: YouTubeVideoDescriptor;
}

const VIDEO_GUIDE_SOURCE_URL = 'https://www.youtube.com/watch?v=cf940AVFnIg';

@Injectable({ providedIn: 'root' })
export class VideoGuideCatalog {
  getMainGuide(): VideoGuide {
    return {
      title: 'Video guia',
      subtitle: 'Material audiovisual',
      description: 'Reproduce el video de apoyo directamente desde YouTube.',
      video: buildYouTubeVideoDescriptor(VIDEO_GUIDE_SOURCE_URL),
    };
  }
}
