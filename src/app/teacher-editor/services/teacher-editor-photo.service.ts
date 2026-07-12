import { Injectable, type OnDestroy, signal } from '@angular/core';
import type { SerializedTeacherPhoto } from '../../core/teachers/teacher-registration.model';
import { DataUrlFileSerializer } from '../../core/teachers/utils/data-url-file.serializer';

@Injectable()
export class TeacherEditorPhotoService implements OnDestroy {
  // Convierte el archivo seleccionado a Data URL cuando el editor necesita enviarlo al servicio.
  private readonly fileSerializer = new DataUrlFileSerializer();

  // URL temporal del navegador usada solo para mostrar la vista previa local de la imagen.
  private previewObjectUrl = '';

  // Archivo original elegido por el usuario; se conserva hasta guardar o limpiar la seleccion.
  private selectedPhoto: File | null = null;

  // Estado reactivo que consume el componente para renderizar la foto actual o la vista previa local.
  readonly photoPreviewUrl = signal('');

  ngOnDestroy(): void {
    // Libera memoria cuando Angular destruye la pagina/servicio.
    this.releasePreviewUrl();
  }

  select(event: Event, setMessage: (message: string) => void): void {
    // El evento viene del input type="file"; si no hay archivo, no hay nada que procesar.
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      // Solo se aceptan imagenes para evitar subir documentos u otros formatos.
      setMessage('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }

    if (file.size > 1_500_000) {
      // Limite de 1.5 MB para mantener liviana la subida y el almacenamiento en cache/local.
      setMessage('La foto debe pesar menos de 1.5 MB.');
      input.value = '';
      return;
    }

    // Reemplaza cualquier vista previa anterior para evitar fugas de memoria en el WebView.
    this.releasePreviewUrl();
    this.selectedPhoto = file;
    this.previewObjectUrl = URL.createObjectURL(file);
    this.photoPreviewUrl.set(this.previewObjectUrl);
    setMessage('');
  }

  setRemotePreview(url: string): void {
    // Muestra la foto existente del docente cuando viene guardada desde Firebase/cache.
    this.photoPreviewUrl.set(url);
  }

  async serializedPhoto(): Promise<SerializedTeacherPhoto | null> {
    // Si el usuario no eligio una foto nueva, no se envia ningun cambio de foto.
    return this.selectedPhoto ? this.fileSerializer.fromFile(this.selectedPhoto) : null;
  }

  clearSelectedPhoto(): void {
    // Despues de guardar, evita volver a enviar la misma foto en una actualizacion futura.
    this.selectedPhoto = null;
  }

  releasePreviewUrl(): void {
    if (this.previewObjectUrl) {
      // Las object URLs reservan memoria; siempre deben revocarse cuando dejan de usarse.
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = '';
    }
  }
}
