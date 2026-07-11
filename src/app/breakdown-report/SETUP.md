# Setup - Averías con Firebase y Cámara

## 📋 Requisitos Previos

- Node.js 20+
- npm 10+
- Angular 20+
- Ionic 8+

## 🔧 Instalación de Dependencias

### 1. Opción A: Instalación Normal (sin conflictos)

```bash
npm install firebase@latest @capacitor/camera --save
```

### 2. Opción B: Con conflictos de peer dependencies

Si obtienes errores de peer dependencies, usa `--legacy-peer-deps`:

```bash
npm install firebase @capacitor/camera --legacy-peer-deps --save
```

### 3. Verificar Instalación

```bash
npm list firebase @capacitor/camera
```

## 🔐 Configuración de Firebase

### 1. Crear un proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear un nuevo proyecto
3. Habilitar Firestore Database
4. Habilitar Storage
5. Copiar la configuración

### 2. Variables de Entorno

Crea archivos `.env` o modifica `environment.ts`:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '1234567890',
    appId: '1:1234567890:web:abcd1234',
  },
};
```

### 3. Inicializar Firebase en app.config.ts

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FIRESTORE_TOKEN, STORAGE_TOKEN } from './core/firebase/firebase-providers';
import { environment } from './environments/environment';

const firebaseApp = initializeApp(environment.firebase);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: FIRESTORE_TOKEN,
      useValue: getFirestore(firebaseApp),
    },
    {
      provide: STORAGE_TOKEN,
      useValue: getStorage(firebaseApp),
    },
    // ... otros providers
  ],
};
```

## 📱 Configuración de Capacitor Camera

### 1. Instalar Capacitor

```bash
npm install @capacitor/core @capacitor/cli --save
```

### 2. Inicializar Capacitor

```bash
npx cap init
```

### 3. Para Android (optional)

```bash
npm install @capacitor/android --save
npx cap add android
```

### 4. Permisos en Android

En `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 5. Permisos en iOS

En `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Se necesita acceso a la cámara para tomar fotos de averías</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Se necesita acceso a la galería para seleccionar fotos</string>
```

## 🔒 Reglas de Firestore

En Firebase Console, establece estas reglas:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /breakdowns/{breakdown} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 🖼️ Reglas de Storage

```storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /breakdowns/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

## ✅ Verificación

### 1. Verificar que los archivos existan

```bash
# Servicios
ls src/app/core/firebase/breakdown.service.ts
ls src/app/core/camera/camera.service.ts
ls src/app/breakdown-report/services/breakdown-report.facade.ts

# Modelos y utilidades
ls src/app/core/models/breakdown.model.ts
ls src/app/core/utils/validators.util.ts
ls src/app/core/utils/mappers.util.ts

# Componente
ls src/app/breakdown-report/breakdown-report.page.ts
```

### 2. Compilar el proyecto

```bash
ng build
```

Si hay errores, verifica que todos los imports estén correctos.

### 3. Ejecutar en desarrollo

```bash
ng serve
```

Navega a http://localhost:4200/averias

## 🐛 Troubleshooting

### Error: Cannot find module 'firebase'

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: Firestore token not provided

Asegúrate de que en `app.config.ts` esté:

```typescript
{
  provide: FIRESTORE_TOKEN,
  useValue: getFirestore(firebaseApp),
},
```

### Error: Camera not working on web

En web, Capacitor simula la cámara. Para usar en móvil:

```bash
npx cap sync
npx cap open android
# o
npx cap open ios
```

### Error: FIRESTORE_TOKEN is not defined

Importa los tokens en los servicios:

```typescript
import { FIRESTORE_TOKEN, STORAGE_TOKEN } from './firebase-providers';
```

## 📚 Estructura de Datos Firestore

```json
{
  "breakdowns": {
    "doc1": {
      "category": "Electricidad",
      "description": "Luz rota en baño 2",
      "priority": "high",
      "location": "Baño 2do nivel",
      "photoUrl": "https://storage.googleapis.com/...",
      "status": "pending",
      "createdAt": "2026-07-10T21:00:00.000Z",
      "updatedAt": "2026-07-10T21:00:00.000Z"
    }
  }
}
```

## 🎯 Próximos Pasos

1. Implementar vista de estado (`/averias/estado`)
2. Listar averías desde Firestore
3. Agregar autenticación con Firebase Auth
4. Implementar notificaciones
5. Agregar filtros y búsqueda

## 📞 Soporte

Para más información sobre:
- **Firebase**: https://firebase.google.com/docs
- **Capacitor Camera**: https://capacitorjs.com/docs/apis/camera
- **Angular**: https://angular.io/docs
- **Clean Architecture**: Ver ARQUITECTURA.md
