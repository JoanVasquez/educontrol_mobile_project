# 🚀 Módulo de Averías - Sistema Completo

Implementación profesional del módulo de averías con **Clean Code**, **SOLID Principles**, **Design Patterns**, **Firebase** e integración de **cámara**.

## ✨ Características

✅ **Captura de fotos** con cámara o galería  
✅ **Almacenamiento en Firebase** (Firestore + Storage)  
✅ **Validación robusta** de datos  
✅ **Mensajes de error/éxito** dinámicos  
✅ **UI responsive** y accesible  
✅ **Estado reactivo** con RxJS  
✅ **Código testeable** y mantenible  
✅ **Arquitectura limpia** en capas  

## 📦 Archivos Principales

```
✓ breakdown.service.ts          - Repositorio de datos (Firebase)
✓ camera.service.ts              - Adaptador de cámara
✓ breakdown-report.facade.ts     - Orquestador de lógica
✓ breakdown.model.ts             - Modelos de dominio
✓ validators.util.ts             - Funciones de validación
✓ mappers.util.ts                - Transformación de datos
✓ firebase-providers.ts          - Inyección de dependencias
✓ breakdown-report.page.ts/html  - Componente y plantilla
✓ breakdown-report.page.scss     - Estilos
```

## 🎯 Flujo de Uso

### 1. Acceder al módulo
```
http://localhost:4200/averias
```

### 2. Registrar avería

1. Seleccionar categoría
2. Escribir descripción
3. Elegir prioridad (Baja, Media, Alta)
4. Ingresar ubicación
5. **Tomar foto** o seleccionar de galería
6. Click en "Enviar reporte"

### 3. Los datos se guardan automáticamente en Firebase

```
Firestore: breakdowns/
├── id1 { category, description, priority, location, photoUrl, status, createdAt }
├── id2 { ... }
└── id3 { ... }

Storage: breakdowns/
├── id1_timestamp_filename.jpg
├── id2_timestamp_filename.jpg
└── ...
```

## 🏗️ Arquitectura

```
Presentation (breakdown-report.page)
    ↓ inyecta
Application (breakdown-report.facade)
    ↓ usa
Domain (models, utils)
    ↓ utiliza
Infrastructure (services)
    ↓ conecta a
Firebase (Firestore + Storage + Camera)
```

### Design Patterns Implementados

1. **Repository Pattern** - `BreakdownService`
2. **Facade Pattern** - `BreakdownReportFacade`
3. **Adapter Pattern** - `CameraService`
4. **Factory Pattern** - `createBreakdown()`
5. **Dependency Injection** - FIRESTORE_TOKEN, STORAGE_TOKEN

### SOLID Principles

| Principio | Implementación |
|-----------|-----------------|
| **S**ingle Responsibility | Cada servicio con una única responsabilidad |
| **O**pen/Closed | Fácil de extender sin modificar |
| **L**iskov Substitution | Servicios intercambiables |
| **I**nterface Segregation | Interfaces específicas y pequeñas |
| **D**ependency Inversion | Inyección de dependencias |

## 🚀 Instalación Rápida

### 1. Instalar dependencias

```bash
npm install firebase @capacitor/camera --legacy-peer-deps
```

### 2. Configurar Firebase

```typescript
// app.config.ts
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
  ],
};
```

### 3. Variables de entorno

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123...',
    appId: '1:123...',
  },
};
```

### 4. Listo! ✅

```bash
ng serve
# Abre http://localhost:4200/averias
```

## 📚 Documentación

- [ARQUITECTURA.md](./ARQUITECTURA.md) - Explicación detallada de la arquitectura
- [SETUP.md](./SETUP.md) - Guía completa de instalación y configuración
- [breakdown-report.page.spec.example.ts](./breakdown-report.page.spec.example.ts) - Ejemplos de tests

## 🧪 Testing

```bash
# Ejecutar tests
ng test

# Con cobertura
ng test --code-coverage
```

### Ejemplos de Tests

Ver `breakdown-report.page.spec.example.ts` con:
- Tests de validación de prioridad
- Tests de captura de fotos
- Tests de validación de formulario
- Tests de envío de datos
- Tests de manejo de errores

## 🔐 Seguridad

### Firestore Rules

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

### Storage Rules

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

## 🎨 Interfaz de Usuario

- **Selección de categoría** - Dropdown intuitivo
- **Prioridad visual** - Botones con colores (Verde=Baja, Naranja=Media, Rojo=Alta)
- **Captura de foto mejorada** - 3 opciones:
  - Tomar foto con cámara
  - Seleccionar de galería
  - Subir archivo
- **Validación en tiempo real** - Mensajes de error inmediatos
- **Indicadores de carga** - Spinner durante envío
- **Mensajes de éxito** - Confirmación visual

## 📊 Estructura de Datos

```typescript
interface Breakdown {
  id?: string;
  category: BreakdownCategory;      // 'Electricidad' | 'Plomería' | ...
  description: string;               // Descripción detallada
  priority: Priority;                // 'low' | 'medium' | 'high'
  location: string;                  // Ubicación en la institución
  photoUrl: string | null;           // URL de la foto en Storage
  status: BreakdownStatus;           // 'pending' | 'in-progress' | 'resolved'
  createdAt: string;                 // ISO date string
  updatedAt?: string;                // ISO date string
}
```

## 🔄 Flujo de Datos Reactivo

```
Usuario interactúa
    ↓
Componente emite evento
    ↓
Facade recibe y orquesta
    ↓
Valida datos (validators.util)
    ↓
Mapea a modelo (mappers.util)
    ↓
Sube foto (CameraService)
    ↓
Crea en Firestore (BreakdownService)
    ↓
Actualiza estado (BehaviorSubject)
    ↓
Componente recibe cambios (Observable)
    ↓
Template se actualiza (change detection)
    ↓
Usuario ve resultado
```

## 🌟 Ventajas de esta Implementación

✅ **Mantenibilidad** - Código organizado y autodocumentado  
✅ **Escalabilidad** - Fácil agregar nuevas funcionalidades  
✅ **Testabilidad** - Cada capa se puede testear independientemente  
✅ **Reusabilidad** - Servicios reutilizables  
✅ **Flexibilidad** - Fácil cambiar Firebase por otra solución  
✅ **Rendimiento** - RxJS para manejo eficiente de datos  
✅ **Seguridad** - Validación robusta en capas  
✅ **UX** - Interfaz clara y responsiva  

## 🚦 Próximos Pasos Sugeridos

1. Implementar vista de estado (`/averias/estado`)
2. Listar averías desde Firestore
3. Filtrar por categoría, prioridad, ubicación
4. Buscar averías
5. Agregar autenticación
6. Implementar notificaciones
7. Agregar edición de averías
8. Exportar reportes

## 📞 Referencia Rápida

| Tarea | Archivo |
|-------|---------|
| Cambiar reglas de validación | `validators.util.ts` |
| Agregar categoría | `breakdown.model.ts` |
| Cambiar Firebase | `firebase-providers.ts` |
| Modificar UI | `breakdown-report.page.html/scss` |
| Agregar validación | `breakdown-report.facade.ts` |
| Cambiar lógica de cámara | `camera.service.ts` |

## 💡 Tips de Desarrollo

```bash
# Desarrollo
ng serve

# Build production
ng build --configuration production

# Tests
ng test --watch

# Linting
ng lint --fix

# Para Android
npx cap sync android
npx cap open android

# Para iOS
npx cap sync ios
npx cap open ios
```

## 📄 Licencia

Desarrollado como parte del proyecto EduControl.

---

**¿Necesitas ayuda?** Lee [SETUP.md](./SETUP.md) o [ARQUITECTURA.md](./ARQUITECTURA.md)
