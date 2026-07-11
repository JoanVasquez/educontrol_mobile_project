import { Injectable } from '@angular/core';
import type { BreakdownPhotoEvidence } from '../models/breakdown.model';

const JPEG_CONTENT_TYPE = 'image/jpeg';
const DEFAULT_MAX_WIDTH = 800;
const DEFAULT_MAX_HEIGHT = 800;
const DEFAULT_QUALITY = 0.68;
const MIN_QUALITY = 0.42;
const QUALITY_STEP = 0.08;
const DEFAULT_MAX_DATA_URL_BYTES = 750_000;

export interface BreakdownPhotoSerializationOptions {
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
  maxDataUrlBytes?: number;
}

@Injectable({ providedIn: 'root' })
export class BreakdownPhotoSerializer {
  async serialize(file: File, options: BreakdownPhotoSerializationOptions = {}): Promise<BreakdownPhotoEvidence> {
    const maxWidth = options.maxWidth ?? DEFAULT_MAX_WIDTH;
    const maxHeight = options.maxHeight ?? DEFAULT_MAX_HEIGHT;
    const maxDataUrlBytes = options.maxDataUrlBytes ?? DEFAULT_MAX_DATA_URL_BYTES;
    const image = await this.loadImage(file);
    const canvas = this.drawResizedImage(image, maxWidth, maxHeight);
    const dataUrl = this.compressCanvas(canvas, options.initialQuality ?? DEFAULT_QUALITY, maxDataUrlBytes);

    return {
      dataUrl,
      name: this.toJpegName(file.name),
      contentType: JPEG_CONTENT_TYPE,
    };
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('No se pudo procesar la imagen seleccionada.'));
      };
      image.src = objectUrl;
    });
  }

  private drawResizedImage(image: HTMLImageElement, maxWidth: number, maxHeight: number): HTMLCanvasElement {
    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('El navegador no permite comprimir la imagen.');
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  private compressCanvas(canvas: HTMLCanvasElement, initialQuality: number, maxDataUrlBytes: number): string {
    let quality = initialQuality;
    let dataUrl = canvas.toDataURL(JPEG_CONTENT_TYPE, quality);

    while (this.byteLength(dataUrl) > maxDataUrlBytes && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      dataUrl = canvas.toDataURL(JPEG_CONTENT_TYPE, quality);
    }

    if (this.byteLength(dataUrl) > maxDataUrlBytes) {
      throw new Error('La foto sigue siendo demasiado grande. Toma una foto mas cercana o con menos detalle.');
    }

    return dataUrl;
  }

  private byteLength(value: string): number {
    return new Blob([value]).size;
  }

  private toJpegName(name: string): string {
    const cleanName = name.trim() || 'averia';
    return cleanName.replace(/\.[^.]+$/, '') + '.jpg';
  }
}
