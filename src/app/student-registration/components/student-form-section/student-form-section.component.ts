import { Component, input } from '@angular/core';

@Component({
  selector: 'app-student-form-section',
  templateUrl: './student-form-section.component.html',
  styleUrls: ['./student-form-section.component.scss'],
})
export class StudentFormSectionComponent {
  readonly title = input.required<string>();
}
