# Registro de docentes en Firebase

La aplicación registra docentes en la colección `docentes` y guarda sus fotos en `docentes/{teacherId}/perfil.{ext}` dentro de Firebase Storage.

## Arquitectura

- `TeacherRegistrationPage`: captura datos y presenta resultados.
- `TeacherRegistrationService`: caso de uso, sesión, modo offline y sincronización.
- `TeacherRemoteRepository`: escritura idempotente en Firestore.
- `TeacherPhotoRepository`: carga de fotos en Firebase Storage.
- `PendingTeacherRepository`: cola local de registros pendientes.
- `TeacherFirestoreMapper`: traducción del dominio al formato REST de Firestore.
- `DataUrlFileSerializer`: serialización de fotos para la cola offline.

## Reglas

Antes de probar contra Firebase, despliega:

```bash
firebase deploy --only firestore:rules,storage
```

El usuario autenticado debe tener un documento `user/{uid}` con estado activo y rol `admin`, `director` o `secretaria`.

## Comportamiento offline

Si no hay conexión, sesión válida o Firebase rechaza temporalmente la operación, el comando completo se guarda en `educontrol.pending.teacher-registrations`. La sincronización se reintenta al recuperar la conexión.
