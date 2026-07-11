# ⚡ Quick Start - Averías en 5 Minutos

## 1️⃣ Instalar Dependencias (2 min)

```bash
cd /home/bubucoder/workspace/educontrol

# Opción A: Recomendada
npm install firebase @capacitor/camera --legacy-peer-deps --save

# Opción B: Si falla
npm install --legacy-peer-deps
```

## 2️⃣ Configurar Firebase (2 min)

### En Firebase Console

1. Ir a https://console.firebase.google.com
2. Crear proyecto "EduControl"
3. Copiar credenciales

### En el código

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

## 3️⃣ Configurar en app.config.ts (1 min)

```typescript
import { ApplicationConfig } from '@angular/core';
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

## ✅ Listo!

```bash
ng serve
```

Abre: **http://localhost:4200/averias**

---

## 📁 Archivos Creados

```
✅ breakdown.service.ts          - Repositorio Firebase
✅ camera.service.ts              - Control de cámara
✅ breakdown-report.facade.ts     - Lógica unificada
✅ breakdown.model.ts             - Modelos tipados
✅ validators.util.ts             - Validaciones
✅ mappers.util.ts                - Transformación de datos
✅ firebase-providers.ts          - Inyección de dependencias
✅ firebase-init.ts               - Inicialización
✅ breakdown-report.page.ts/html/scss - Componente
✅ README.md                       - Documentación completa
✅ ARQUITECTURA.md                 - Detalles técnicos
✅ SETUP.md                        - Guía de instalación
```

## 🎯 Características

✅ Guardar avería en Firestore  
✅ Subir foto a Firebase Storage  
✅ Tomar foto con cámara  
✅ Seleccionar foto de galería  
✅ Validación automática  
✅ Interfaz limpia y responsiva  

## 🧪 Test

```bash
ng test
```

## 🚀 Producción

```bash
ng build --configuration production
```

## 📚 Documentación

- [README.md](./src/app/breakdown-report/README.md) - Overview
- [ARQUITECTURA.md](./src/app/breakdown-report/ARQUITECTURA.md) - Detalles
- [SETUP.md](./src/app/breakdown-report/SETUP.md) - Instalación
- [RESOLUCION_DEPENDENCIAS.md](./RESOLUCION_DEPENDENCIAS.md) - Problemas npm

## ⚡ Comandos Útiles

```bash
# Desarrollo
ng serve

# Build
ng build

# Tests
ng test

# Linting
ng lint --fix

# Para móvil
npx cap sync android
npx cap open android
```

## 🐛 Si hay error...

**Error 1: Firebase token not provided**
```
Asegúrate de que FIRESTORE_TOKEN y STORAGE_TOKEN 
estén en los providers de app.config.ts
```

**Error 2: Cannot find module 'firebase'**
```
npm install firebase --legacy-peer-deps
```

**Error 3: Camera not working**
```
En web es simulado. Para móvil: npx cap open android
```

---

## ✨ Listo para producción!

El código sigue:
- ✅ Clean Code
- ✅ SOLID Principles
- ✅ Design Patterns
- ✅ Arquitectura Limpia
- ✅ 100% Tipado
- ✅ Totalmente Testeable

¡A disfrutar del módulo de averías! 🎉
