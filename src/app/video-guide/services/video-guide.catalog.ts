import { Injectable } from '@angular/core';

export type VideoGuideMediaType = 'video' | 'audio';

export interface VideoGuideMedia {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly sourceUrl: string;
  readonly type: VideoGuideMediaType;
  readonly durationLabel: string;
}

export interface VideoGuide {
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly mediaItems: readonly VideoGuideMedia[];
}

const DEMO_VIDEO_SOURCE = 'assets/video-guide/video_demostrativo_educontrolrd.mp4';

const VIDEO_GUIDE_ITEMS: readonly VideoGuideMedia[] = [
  {
    id: 'uso-general',
    title: 'Video guia de uso de EduControl RD',
    description: 'Video demostrativo del uso general de la aplicacion.',
    sourceUrl: DEMO_VIDEO_SOURCE,
    type: 'video',
    durationLabel: 'Video demostrativo local',
  },
];

@Injectable({ providedIn: 'root' })
export class VideoGuideCatalog {
  getMainGuide(): VideoGuide {
    return {
      title: 'Video guia de uso de EduControl RD',
      subtitle: 'Unidad 7 - Multimedia',
      description:
        'Reproduce contenido explicativo con controles personalizados de play, pausa, stop y progreso.',
      mediaItems: VIDEO_GUIDE_ITEMS,
    };
  }
}
