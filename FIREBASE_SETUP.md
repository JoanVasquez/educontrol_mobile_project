# Configuración inicial de Firebase para EduControl RD

## Proyecto

La aplicación usa el proyecto Firebase `educontrol-mobile` y se conecta desde Ionic mediante los endpoints oficiales de Firebase Authentication y Firestore configurados en los archivos `environment`.

## Usuario IT/Admin inicial

Crear manualmente en Firebase Authentication un usuario inicial con los siguientes datos:

- Email: `dev.joanvasquez@gmail.com`
- UID esperado: `MDOkiUUciFa0ixvRFKlTax10yQ72`
- Contraseña: definida manualmente en la consola de Firebase Authentication.

No se debe guardar la contraseña en el código fuente.

## Perfil en Firestore

Crear o validar el documento de perfil en la colección `users`:

```text
users
 └── MDOkiUUciFa0ixvRFKlTax10yQ72
      ├── email: "dev.joanvasquez@gmail.com"
      ├── fullName: "Usuario IT"
      ├── role: "admin"
      ├── status: "active"
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

El campo `role: "admin"` habilita acceso completo en esta primera versión.
