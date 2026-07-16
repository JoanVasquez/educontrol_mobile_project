import { Injectable } from '@angular/core';
import type { BreakdownVideoEvidence } from '../models/breakdown.model';

const DEFAULT_MAX_DATA_URL_BYTES = 900_000;

export interface BreakdownVideoSerializationOptions {
  maxDataUrlBytes?: number;
}

@Injectable({ providedIn: 'root' })
export class BreakdownVideoSerializer {
  async serialize(file: File, options: BreakdownVideoSerializationOptions = {}): Promise<BreakdownVideoEvidence> {
    const dataUrl = await this.readAsDataUrl(file);
    const maxDataUrlBytes = options.maxDataUrlBytes ?? DEFAULT_MAX_DATA_URL_BYTES;

    if (this.byteLength(dataUrl) > maxDataUrlBytes) {
      throw new Error('El video es demasiado grande para adjuntarlo al reporte. Graba un clip mas corto.');
    }

    return {
      dataUrl,
      name: file.name || 'averia-video.mp4',
      contentType: file.type || 'video/mp4',
    };
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('No se pudo leer el video seleccionado.'));
      };
      reader.onerror = () => reject(new Error('No se pudo leer el video seleccionado.'));
      reader.readAsDataURL(file);
    });
  }

  private byteLength(value: string): number {
    return new Blob([value]).size;
  }
}
