export interface StudentRegistrationDraft {
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  nacionalidad: string;
  genero: string;
  curso: string;
  asignaturas: string[];
  nombreMadre: string;
  cedulaMadre: string;
  nombrePadre: string;
  cedulaPadre: string;
  direccion: string;
  telefonoContacto: string;
  fotoUrl: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingStudentRegistration {
  localId: string;
  payload: StudentRegistrationDraft;
  createdAt: string;
}

export interface RegisterStudentResult {
  mode: 'online' | 'offline' | 'queued';
  reason?: 'auth-missing' | 'remote-error';
  synced: boolean;
  pendingCount: number;
}
