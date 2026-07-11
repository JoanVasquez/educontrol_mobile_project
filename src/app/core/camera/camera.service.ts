import { Injectable } from "@angular/core";
import { Camera, CameraResultType, CameraSource, type Photo } from "@capacitor/camera";
import type { Observable } from "rxjs";
import { from, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CameraService {
  takePhoto(): Observable<File> {
    return from(this.getPhotoFromCamera()).pipe(
      switchMap((photo) => from(this.convertPhotoToFile(photo))),
      catchError((error) => this.handleError("No se pudo abrir la camara", error)),
    );
  }

  pickPhotoFromGallery(): Observable<File> {
    return from(this.getPhotoFromGallery()).pipe(
      switchMap((photo) => from(this.convertPhotoToFile(photo))),
      catchError((error) => this.handleError("No se pudo seleccionar la foto", error)),
    );
  }

  private getPhotoFromCamera(): Promise<Photo> {
    return Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      promptLabelPicture: "Tomar foto",
      promptLabelCancel: "Cancelar",
    });
  }

  private getPhotoFromGallery(): Promise<Photo> {
    return Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos,
      promptLabelPicture: "Seleccionar foto",
      promptLabelCancel: "Cancelar",
    });
  }

  private async convertPhotoToFile(photo: Photo): Promise<File> {
    if (!photo.webPath) {
      throw new Error("La foto no devolvio una ruta valida");
    }

    const response = await fetch(photo.webPath);

    if (!response.ok) {
      throw new Error("No se pudo leer la foto tomada");
    }

    const blob = await response.blob();
    const extension = this.extensionFrom(photo.format, blob.type);
    const fileName = "averia_" + Date.now() + "." + extension;

    return new File([blob], fileName, { type: blob.type || "image/" + extension });
  }

  private extensionFrom(format?: string, mimeType?: string): string {
    if (format) {
      return format === "jpeg" ? "jpg" : format;
    }

    if (mimeType?.includes("png")) return "png";
    if (mimeType?.includes("webp")) return "webp";
    if (mimeType?.includes("gif")) return "gif";

    return "jpg";
  }

  private handleError(message: string, error: unknown): Observable<never> {
    const errorMessage = error instanceof Error ? error.message : String(error || "");

    if (errorMessage.toLowerCase().includes("cancel")) {
      return throwError(() => new Error("Operacion cancelada"));
    }

    console.error(message + ":", error);
    return throwError(() => new Error(message + ": " + (errorMessage || "Error desconocido")));
  }
}
