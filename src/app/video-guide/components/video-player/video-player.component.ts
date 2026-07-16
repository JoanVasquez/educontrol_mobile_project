import type { ElementRef} from '@angular/core';
import { Component, input, output, signal, viewChild } from '@angular/core';
import { IonButton, IonIcon, IonRange } from '@ionic/angular/standalone';
import type { RangeCustomEvent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { expand, pause, play, refresh, square } from 'ionicons/icons';
import type { VideoGuideMedia } from '../../services/video-guide.catalog';
import { formatMediaTime } from '../../utils/media-time.util';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss'],
  imports: [IonButton, IonIcon, IonRange],
})
export class VideoPlayerComponent {
  private readonly videoElement = viewChild<ElementRef<HTMLVideoElement>>('player');

  readonly media = input.required<VideoGuideMedia>();
  readonly playbackStateChange = output<string>();

  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly isPlaying = signal(false);
  readonly playbackState = signal('Listo para reproducir');

  constructor() {
    addIcons({ expand, pause, play, refresh, square });
  }

  get currentTimeLabel(): string {
    return formatMediaTime(this.currentTime());
  }

  get durationLabel(): string {
    return formatMediaTime(this.duration());
  }

  async play(): Promise<void> {
    const player = this.player();
    await player.play();
    this.setPlaybackState('Reproduciendo');
  }

  pause(): void {
    this.player().pause();
    this.setPlaybackState('En pausa');
  }

  stop(): void {
    const player = this.player();
    player.pause();
    player.currentTime = 0;
    this.currentTime.set(0);
    this.setPlaybackState('Reiniciado');
  }

  restart(): void {
    const player = this.player();
    player.currentTime = 0;
    void this.play();
  }

  async enterFullscreen(): Promise<void> {
    const player = this.playerWithFullscreen();

    if (player.requestFullscreen) {
      await player.requestFullscreen();
      return;
    }

    if (player.webkitEnterFullscreen) {
      player.webkitEnterFullscreen();
    }
  }

  onLoadStart(): void {
    this.currentTime.set(0);
    this.duration.set(0);
    this.isPlaying.set(false);
    this.setPlaybackState('Listo para reproducir');
  }

  onLoadedMetadata(): void {
    this.duration.set(this.player().duration);
  }

  onTimeUpdate(): void {
    const player = this.player();
    this.currentTime.set(player.currentTime);
    this.duration.set(player.duration);
  }

  onEnded(): void {
    this.isPlaying.set(false);
    this.setPlaybackState('Finalizado');
  }

  onRangeChange(event: RangeCustomEvent): void {
    const selectedTime = Number(event.detail.value);

    if (!Number.isFinite(selectedTime)) {
      return;
    }

    this.player().currentTime = selectedTime;
    this.currentTime.set(selectedTime);
  }

  onPlay(): void {
    this.isPlaying.set(true);
    this.setPlaybackState('Reproduciendo');
  }

  onPause(): void {
    this.isPlaying.set(false);
  }

  private player(): HTMLVideoElement {
    const player = this.videoElement()?.nativeElement;

    if (!player) {
      throw new Error('Video player element is not available.');
    }

    return player;
  }

  private playerWithFullscreen(): HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
  } {
    return this.player();
  }

  private setPlaybackState(state: string): void {
    this.playbackState.set(state);
    this.playbackStateChange.emit(state);
  }
}
