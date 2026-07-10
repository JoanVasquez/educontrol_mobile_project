import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, person } from 'ionicons/icons';
import { AppBottomNavigationComponent } from '../shared/components/app-bottom-navigation/app-bottom-navigation.component';
import { AppPageHeaderComponent } from '../shared/components/app-page-header/app-page-header.component';

@Component({
  selector: 'app-teacher-update',
  templateUrl: './teacher-update.page.html',
  styleUrls: ['./teacher-update.page.scss'],
  imports: [AppBottomNavigationComponent, AppPageHeaderComponent, FormsModule, IonContent, IonIcon],
})
export class TeacherUpdatePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly teacherId = this.route.snapshot.paramMap.get('id') ?? '1';
  readonly message = signal('');

  birthDate = '1985-12-01';
  nationality = 'Dominicana';
  gender = 'Femenino';
  idNumber = '000-0000000-0';
  address = 'Calle Los Prados 62, Santana, Prov. La Altagracia';
  phone = '555-555-5555';
  subject = 'Física';
  course = '3ro A, 4to B';

  readonly nationalities = ['Dominicana', 'Haitiana', 'Venezolana', 'Colombiana', 'Otra'];
  readonly genders = ['Masculino', 'Femenino'];
  readonly subjects = ['Física', 'Matemáticas', 'Química', 'Literatura', 'Inglés'];
  readonly courses = ['3ro A, 4to B', '1ro A, 2do B', '5to A, 6to B'];

  constructor() {
    addIcons({ calendarOutline, person });
  }

  cancel(): void {
    this.router.navigateByUrl('/docentes/listado');
  }

  update(): void {
    const teacher = {
      id: this.teacherId,
      birthDate: this.birthDate,
      nationality: this.nationality,
      gender: this.gender,
      idNumber: this.idNumber.trim(),
      address: this.address.trim(),
      phone: this.phone.trim(),
      subject: this.subject,
      course: this.course,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`teacher-update:${this.teacherId}`, JSON.stringify(teacher));
    this.message.set('Registro actualizado correctamente.');
  }

  deleteTeacher(): void {
    localStorage.setItem(`teacher-deleted:${this.teacherId}`, new Date().toISOString());
    this.router.navigateByUrl('/docentes/listado');
  }
}
