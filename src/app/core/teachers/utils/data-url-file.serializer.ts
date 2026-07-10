import type { SerializedTeacherPhoto } from '../teacher-registration.model';

const DEFAULT_EXTENSION = 'jpg';

export class DataUrlFileSerializer {
  async fromFile(file: File): Promise<SerializedTeacherPhoto> {
    return {
      name: file.name,
      contentType: file.type || 'image/jpeg',
      dataUrl: await this.readAsDataUrl(file),
    };
  }

  toBlob(photo: SerializedTeacherPhoto): Blob {
    const base64 = photo.dataUrl.split(',')[1] ?? '';
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));

    return new Blob([bytes], { type: photo.contentType });
  }

  extensionFrom(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return extension || DEFAULT_EXTENSION;
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Formato de foto inválido.')));
      reader.onerror = () => reject(new Error('No se pudo leer la foto.'));
      reader.readAsDataURL(file);
    });
  }
}
