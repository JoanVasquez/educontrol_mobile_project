import { Component, input } from '@angular/core';
import { IonNote } from '@ionic/angular/standalone';

@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
  styleUrls: ['./field-error.component.scss'],
  imports: [IonNote],
})
export class FieldErrorComponent {
  readonly message = input.required<string>();
}
