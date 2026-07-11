# 🔧 Solución de Conflicto de Dependencias npm

## Problema

```
npm error ERESOLVE could not resolve
npm error ERESOLVE could not resolve
...
npm error Could not resolve dependency:
npm error @angular/fire@"*" from the root project
```

## Causa

La versión de `@angular/fire` tiene conflicto con la versión actual de `@angular/core`.

## Soluciones (por orden de preferencia)

### ✅ Solución 1: Limpiar e Instalar de Cero

```bash
# 1. Eliminar node_modules y lock file
rm -rf node_modules
rm package-lock.json

# 2. Instalar dependencias
npm install

# 3. Luego instalar las nuevas dependencias
npm install firebase @capacitor/camera --legacy-peer-deps --save
```

### ✅ Solución 2: Instalar con --force

```bash
npm install firebase @capacitor/camera --force --save
```

**Ventaja:** Más rápido  
**Riesgo:** Posibles incompatibilidades

### ✅ Solución 3: Instalar versiones específicas

```bash
npm install firebase@^10.5.0 @capacitor/camera@^6.1.0 --legacy-peer-deps --save
```

### ✅ Solución 4: Usar npx con flags

```bash
npx npm install firebase @capacitor/camera --legacy-peer-deps --verbose
```

### ✅ Solución 5: Editar package.json directamente

Agregar manualmente al `package.json`:

```json
{
  "dependencies": {
    "firebase": "^10.5.0",
    "@capacitor/camera": "^6.1.0"
  }
}
```

Luego ejecutar:

```bash
npm install --legacy-peer-deps
```

## Si sigue sin funcionar

### 🔍 Diagnóstico

```bash
# Ver qué versiones están instaladas
npm list firebase @angular/core

# Ver el árbol de dependencias
npm list --depth=0

# Ver el reporte de errores
cat ~/.npm/_logs/*-debug.log
```

### 🧹 Limpiar caché de npm

```bash
# En Windows
npm cache clean --force

# En Mac/Linux
npm cache clean --force
```

### 💪 Opción Nuclear: Usar pnpm

```bash
# Instalar pnpm (más eficiente que npm)
npm install -g pnpm

# Limpiar
rm -rf node_modules
rm pnpm-lock.yaml

# Instalar con pnpm
pnpm install
pnpm add firebase @capacitor/camera
```

## Verificar que funcionó

```bash
# Ver si se instalaron
npm list firebase @capacitor/camera

# Debería mostrar algo como:
# educontrol@0.0.1
# ├── firebase@10.5.0
# └── @capacitor/camera@6.1.0
```

## Si Firebase aún no funciona

Como alternativa, Firebase puede usarse sin `@angular/fire`:

```typescript
// Sin @angular/fire - Usando firebase directamente
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
```

Esta es exactamente la estrategia que usamos en nuestro código, así que **NO necesitas `@angular/fire`**, solo `firebase`.

## Instalación Alternativa (SIN @angular/fire)

```bash
npm install firebase @capacitor/camera --legacy-peer-deps --save
```

Esto es más ligero y evita conflictos.

## Comandos que Funcionan Generalmente

### Opción A: Con flags
```bash
npm install --legacy-peer-deps
```

### Opción B: Limpiar y reinstalar
```bash
npm ci --legacy-peer-deps
```

### Opción C: Usar npm 7+
Si tienes npm 8 o superior:
```bash
npm install firebase @capacitor/camera --no-save
npm ci
```

## Resumen

1. **Lo primero**: `npm install firebase @capacitor/camera --legacy-peer-deps --save`
2. **Si falla**: `rm -rf node_modules && npm install --legacy-peer-deps`
3. **Si sigue fallando**: Usa `pnpm` en lugar de `npm`
4. **Si quieres lo más simple**: Nuestro código ya está preparado para funcionar sin instalación (usa las funciones puras)

## Verificación Final

```bash
# Compilar el proyecto
ng build

# Si no hay errores, está todo correcto ✅
```

---

**Nota importante:** El código implementado usa Firebase directamente, **no necesita `@angular/fire`**. Esto lo hace más ligero y sin dependencias innecesarias.
