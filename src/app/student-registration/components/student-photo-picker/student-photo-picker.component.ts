import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-student-photo-picker',
  templateUrl: './student-photo-picker.component.html',
  styleUrls: ['./student-photo-picker.component.scss'],
  imports: [IonIcon],
})
export class StudentPhotoPickerComponent {
  readonly previewUrl = input<string | null>(null);
  readonly photoSelected = output<File>();

  constructor() {
    addIcons({ cameraOutline });
  }

  selectPhoto(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const file = input?.files?.[0];

    if (file) {
      this.photoSelected.emit(file);
    }
  }
}
