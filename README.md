# EduControl

Aplicación Ionic/Angular para gestión escolar. Incluye asistencia, estudiantes, docentes, averías, conectividad offline, Wi‑Fi Direct y geolocalización.

## GPS, geolocalización y lugares cercanos

La ruta autenticada `/ubicacion` permite:

- Solicitar la ubicación actual del dispositivo.
- Mantener seguimiento en primer plano con actualizaciones en tiempo real.
- Mostrar latitud, longitud, hora de actualización y precisión estimada.
- Compartir la ubicación más reciente mediante Web Share API o copiarla al portapapeles.
- Abrir la ubicación o un lugar cercano en OpenStreetMap.
- Buscar restaurantes, tiendas, turismo, salud y educación en radios de 500 m a 5 km.

La opción está disponible desde **Más → Ubicación y lugares**.

### Dependencia nativa

La ubicación se obtiene con:

```text
@capacitor/geolocation
```

Después de instalar o actualizar dependencias se debe ejecutar:

```bash
npx cap sync android
```

### Permisos

Android declara en `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

También declara GPS como hardware opcional. La app funciona en dispositivos sin GPS usando la ubicación aproximada disponible por red. Solo se realiza seguimiento mientras la pantalla está abierta; no se solicita ubicación en segundo plano.

En navegador, la geolocalización requiere HTTPS o `localhost`. El usuario debe aceptar el permiso mostrado por el sistema.

### Arquitectura y funciones

| Archivo | Responsabilidad |
| --- | --- |
| `core/location/geolocation.gateway.ts` | Adaptador de `@capacitor/geolocation`; solicita permisos e implementa ubicación actual y seguimiento. |
| `core/location/location.service.ts` | Caso de uso para ubicación, calidad, búsqueda y fallback de caché. |
| `core/location/nearby-place.repository.ts` | Consulta la API Overpass de OpenStreetMap. |
| `core/location/nearby-place.mapper.ts` | Convierte nodos, vías y relaciones de Overpass al modelo `NearbyPlace`. |
| `core/location/nearby-place-cache.repository.ts` | Guarda resultados recientes en `localStorage`. |
| `core/location/location-share.service.ts` | Comparte un enlace OSM o lo copia al portapapeles. |
| `core/location/location-accuracy.util.ts` | Clasifica precisión y calcula distancias con Haversine. |
| `location/location.page.*` | Presentación y estados de interacción. |

### Procesamiento de datos

1. `GeolocationGateway` solicita permisos de ubicación con `checkPermissions` y `requestPermissions`.
2. `getCurrentPosition` y `watchPosition` usan alta precisión, timeout de 15 segundos y antigüedad máxima de 5 segundos.
3. Las coordenadas se convierten a `GeoPoint`; no se envían a Firebase ni se almacenan como historial.
4. Al buscar lugares, la app envía latitud, longitud, radio y filtros de categoría a Overpass.
5. `NearbyPlaceMapper` normaliza nombre, categoría, dirección y coordenadas.
6. `LocationAccuracyUtil` calcula la distancia desde el usuario mediante la fórmula Haversine.
7. Los lugares se ordenan por distancia y se limita la respuesta a 40 elementos.
8. La respuesta se conserva 15 minutos en `localStorage`; solo se reutiliza si la nueva posición está a menos de 500 metros y los filtros coinciden.

### Precisión y estabilidad

- **Alta:** hasta 25 m.
- **Media:** entre 25 m y 100 m.
- **Baja:** más de 100 m.

La precisión mostrada proviene de `Position.coords.accuracy`. Interiores, ahorro de batería, GPS desactivado o poca visibilidad del cielo pueden reducirla.

La consulta de lugares incluye:

- Timeout de 18 segundos.
- Un reintento automático.
- Servidor principal y servidor alternativo de Overpass.
- Caché local cuando no hay red o los servidores fallan.
- Estado de conectividad proporcionado por `@capacitor/network`.

El endpoint principal de Overpass fue verificado con una consulta real el 24 de junio de 2026. Como las instancias públicas pueden saturarse, la aplicación no depende de una única respuesta: aplica timeout, reintento, fallback y caché.

### Privacidad

- No se almacena historial de coordenadas.
- No se envía la ubicación a Firebase.
- El seguimiento se detiene al salir de la pantalla.
- Compartir requiere una acción explícita del usuario.
- El enlace compartido contiene únicamente las coordenadas actuales y la precisión aproximada.

### Pruebas recomendadas

1. Probar en exterior con GPS activado y verificar precisión menor a 25–50 m.
2. Activar “Seguir en vivo”, caminar y confirmar actualización de coordenadas.
3. Rechazar permisos y comprobar el mensaje de error.
4. Buscar lugares con varias categorías y radios.
5. Desactivar la conexión después de una búsqueda y verificar el uso de caché.
6. Compartir la ubicación y abrir el enlace en OpenStreetMap.

## Comandos

```bash
npm run lint
npm run build
npx cap sync android
```
