# Arquitectura de Averías - Clean Code & SOLID Principles

## 📋 Descripción General

Implementación de módulo de Averías (Breakdowns) con integración a Firebase, captura de fotos con Capacitor, siguiendo principios de **Clean Code** y **SOLID**, con **Design Patterns** y **Architectura Limpia**.

## 🏗️ Arquitectura

### Capas

```
┌─────────────────────────────────┐
│    Presentation Layer           │
│  (breakdown-report.page.ts/html)│
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Application Layer            │
│   (breakdown-report.facade.ts)  │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Domain Layer                 │
│  (models, utils, validators)    │
└──────────────┬──────────────────┘
               │
┌──────────────▼──────────────────┐
│    Infrastructure Layer         │
│  (services, firebase, camera)   │
└─────────────────────────────────┘
```

## 📁 Estructura de Archivos

```
src/app/
├── breakdown-report/
│   ├── breakdown-report.page.ts          # Componente (Presentación)
│   ├── breakdown-report.page.html        # Template
│   ├── breakdown-report.page.scss        # Estilos
│   └── services/
│       └── breakdown-report.facade.ts    # Orquestador de lógica
│
├── core/
│   ├── models/
│   │   └── breakdown.model.ts            # Modelos de dominio
│   │
│   ├── utils/
│   │   ├── validators.util.ts            # Funciones de validación (puras)
│   │   └── mappers.util.ts               # Mapeadores de datos
│   │
│   ├── firebase/
│   │   ├── breakdown.service.ts          # Repositorio (Acceso a datos)
│   │   ├── firebase-config.model.ts      # Configuración
│   │   ├── firebase-init.ts              # Inicialización
│   │   └── firebase-providers.ts         # Inyección de dependencias
│   │
│   └── camera/
│       └── camera.service.ts             # Adaptador de Capacitor Camera
```

## 🎯 SOLID Principles

### 1. **S - Single Responsibility Principle**

Cada clase/servicio tiene una única responsabilidad:

- `BreakdownService`: Solo maneja operaciones con Firebase
- `CameraService`: Solo maneja captura de fotos
- `BreakdownReportFacade`: Orquesta entre servicios
- `BreakdownReportPage`: Solo maneja presentación

```typescript
// ✅ CORRECTO: Una responsabilidad
@Injectable()
export class CameraService {
  takePhoto(): Observable<File> { /* ... */ }
  pickPhotoFromGallery(): Observable<File> { /* ... */ }
}

// ❌ INCORRECTO: Múltiples responsabilidades
@Injectable()
export class PhotoService {
  takePhoto() { /* ... */ }
  uploadPhoto() { /* ... */ }  // Esto es responsabilidad de otro servicio
  deletePhoto() { /* ... */ }
}
```

### 2. **O - Open/Closed Principle**

Código abierto para extensión, cerrado para modificación:

```typescript
// Validadores extensibles
export function isValidImageFile(file: File): boolean {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validMimeTypes.includes(file.type);
}

// Fácil de extender sin modificar la función original
const customValidator = (file: File) => {
  return isValidImageFile(file) && file.size < 10 * 1024 * 1024;
};
```

### 3. **L - Liskov Substitution Principle**

Los servicios pueden ser reemplazados por sus implementaciones:

```typescript
// Puedes inyectar diferentes implementaciones
interface IPhotoService {
  takePhoto(): Observable<File>;
  pickPhotoFromGallery(): Observable<File>;
}

@Injectable()
export class CameraService implements IPhotoService { /* ... */ }

@Injectable()
export class MockCameraService implements IPhotoService { /* ... */ }
```

### 4. **I - Interface Segregation Principle**

Interfaces pequeñas y específicas:

```typescript
// ✅ CORRECTO: Interfaces específicas
interface IBreakdownRepository {
  create(breakdown: Breakdown): Observable<Breakdown>;
  getById(id: string): Observable<Breakdown>;
  getAll(): Observable<Breakdown[]>;
}

// ❌ INCORRECTO: Interfaz monolítica
interface IService {
  create() {}
  read() {}
  update() {}
  delete() {}
  // ... más métodos
}
```

### 5. **D - Dependency Inversion Principle**

Depender de abstracciones, no de implementaciones concretas:

```typescript
// ✅ CORRECTO: Inyección de dependencias
@Injectable()
export class BreakdownService {
  private readonly firestore = inject(FIRESTORE_TOKEN);
  private readonly storage = inject(STORAGE_TOKEN);
}

// ❌ INCORRECTO: Directamente instanciadas
export class BreakdownService {
  private firestore = new Firestore();
  private storage = new Storage();
}
```

## 🎨 Design Patterns

### 1. **Repository Pattern**

`BreakdownService` implementa el patrón Repository para abstracción de datos:

```typescript
@Injectable()
export class BreakdownService {
  createBreakdown(breakdown: Breakdown): Observable<Breakdown> { /* ... */ }
  getAllBreakdowns(): Observable<Breakdown[]> { /* ... */ }
  getBreakdownsByLocation(location: string): Observable<Breakdown[]> { /* ... */ }
  updateBreakdown(id: string, updates: Partial<Breakdown>): Observable<void> { /* ... */ }
  deleteBreakdown(id: string): Observable<void> { /* ... */ }
}
```

**Beneficios:**
- Desacoplamiento de la capa de datos
- Fácil de testear
- Permite cambiar de BDD sin afectar el código de negocio

### 2. **Facade Pattern**

`BreakdownReportFacade` simplifica la interacción entre servicios:

```typescript
@Injectable()
export class BreakdownReportFacade {
  constructor(
    private breakdownService: BreakdownService,
    private cameraService: CameraService,
  ) {}

  submitBreakdownReport(
    category: BreakdownCategory,
    description: string,
    priority: Priority,
    location: string,
  ): Observable<Breakdown> {
    // Orquesta entre múltiples servicios
    // Maneja validación
    // Coordina flujo de datos
  }
}
```

**Beneficios:**
- Interfaz unificada y simple
- Componentes no necesitan saber sobre múltiples servicios
- Fácil de mantener y testear

### 3. **Adapter Pattern**

`CameraService` adapta la API de Capacitor:

```typescript
@Injectable()
export class CameraService {
  takePhoto(): Observable<File> {
    return from(this.getPhotoFromCamera()).pipe(
      map((photo) => this.convertPhotoToFile(photo)),
      catchError((error) => this.handleError('Camera error', error)),
    );
  }
}
```

**Beneficios:**
- Abstracción de la complejidad de Capacitor
- Fácil de cambiar o mockear
- Consistencia en la interfaz

### 4. **Factory Pattern**

Función de fábrica para crear modelos:

```typescript
export function createBreakdown(
  category: BreakdownCategory,
  description: string,
  priority: Priority,
  location: string,
  photoUrl: string | null = null,
): Breakdown {
  return {
    category,
    description,
    priority,
    location,
    photoUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}
```

## 🧹 Clean Code Principles

### 1. **Nombres Significativos**

```typescript
// ✅ CORRECTO: Claro qué hace
const validateBreakdownForm = (category, description, location) => { /* ... */ };
const uploadPhotoToStorage = (file, breakdownId) => { /* ... */ };

// ❌ INCORRECTO: Vago
const check = (a, b, c) => { /* ... */ };
const upload = (f, id) => { /* ... */ };
```

### 2. **Funciones Pequeñas y Enfocadas**

```typescript
// ✅ CORRECTO: Una responsabilidad
private validateAndSetPhoto(photo: File): void {
  if (!isValidImageFile(photo)) {
    this.setError('El archivo debe ser una imagen...');
    return;
  }

  if (!isValidFileSize(photo)) {
    this.setError('La imagen debe ser menor a 5MB');
    return;
  }

  this.selectedPhoto$.next(photo);
}
```

### 3. **Comentarios Explicativos**

```typescript
/**
 * Upload a photo to Firebase Storage
 * @param file The image file to upload
 * @param breakdownId The breakdown ID for organizing storage
 * @returns Observable with the download URL
 */
uploadPhoto(file: File, breakdownId: string): Observable<string> { /* ... */ }
```

### 4. **Manejo de Errores**

```typescript
private handleError(message: string, error: any): Observable<never> {
  // No registres como error si el usuario canceló
  if (error?.message?.includes('User cancelled')) {
    return throwError(() => new Error('User cancelled operation'));
  }

  console.error(`${message}:`, error);
  return throwError(() => new Error(`${message}: ${error?.message || 'Unknown error'}`));
}
```

## 🔄 Flujo de Datos

### Captura de Foto

```
Usuario click "Tomar foto"
         ↓
BreakdownReportPage.takePhoto()
         ↓
BreakdownReportFacade.takePhoto()
         ↓
CameraService.takePhoto()
         ↓
Capacitor Camera API
         ↓
Valida imagen (isValidImageFile)
Valida tamaño (isValidFileSize)
         ↓
Guarda en estado (selectedPhoto$)
```

### Envío de Reporte

```
Usuario click "Enviar reporte"
         ↓
BreakdownReportPage.submit()
         ↓
Valida formulario (validateBreakdownForm)
         ↓
BreakdownReportFacade.submitBreakdownReport()
         ↓
Mapea datos (mapFormToBreakdown)
         ↓
Si hay foto → BreakdownService.uploadPhoto()
         ↓
BreakdownService.createBreakdown()
         ↓
Firebase Firestore ✅
```

## 📦 Inyección de Dependencias

### Configuración

```typescript
// En app.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FIRESTORE_TOKEN, STORAGE_TOKEN } from './core/firebase/firebase-providers';

const firebaseApp = initializeApp(firebaseConfig);

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

### Uso en Servicios

```typescript
@Injectable()
export class BreakdownService {
  private readonly firestore = inject(FIRESTORE_TOKEN);
  private readonly storage = inject(STORAGE_TOKEN);
}
```

## 🧪 Testabilidad

### Mock del Facade

```typescript
class MockBreakdownReportFacade extends BreakdownReportFacade {
  override submitBreakdownReport(
    category: BreakdownCategory,
    description: string,
    priority: Priority,
    location: string,
  ): Observable<Breakdown> {
    return of({
      id: '123',
      category,
      description,
      priority,
      location,
      photoUrl: null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }
}
```

### Test del Componente

```typescript
describe('BreakdownReportPage', () => {
  it('should submit breakdown report', fakeAsync(() => {
    const facade = TestBed.inject(BreakdownReportFacade);
    spyOn(facade, 'submitBreakdownReport').and.returnValue(of(mockBreakdown));

    component.submitBreakdownReport('Electricidad', 'Luz rota', 'high', 'Baño');

    tick();
    expect(facade.submitBreakdownReport).toHaveBeenCalled();
  }));
});
```

## 🚀 Ventajas de esta Arquitectura

✅ **Mantenibilidad**: Código organizado y fácil de entender
✅ **Testabilidad**: Servicios desacoplados, fáciles de mockear
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades
✅ **Reusabilidad**: Servicios reutilizables en otros componentes
✅ **Flexibilidad**: Fácil cambiar implementaciones (Firebase por otra BDD)
✅ **Documentación**: Código autodocumentado con tipos y comentarios

## 📚 Referencias

- [Clean Code - Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles - Martin Fowler](https://martinfowler.com/)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Facade Pattern](https://refactoring.guru/design-patterns/facade)
