# Informe técnico: GPS, geolocalización y búsqueda de lugares cercanos

## 1. Información general

**Proyecto:** EduControl  
**Tecnologías principales:** Ionic, Angular, Capacitor y Android  
**Servicio de lugares:** OpenStreetMap mediante Overpass API  
**Fecha de verificación:** 24 de junio de 2026

## 2. Objetivo

El objetivo del módulo fue incorporar funciones de geolocalización que permitan:

- Obtener la ubicación actual del usuario.
- Actualizar la ubicación en tiempo real.
- Mostrar la precisión reportada por el dispositivo.
- Compartir la ubicación mediante un enlace.
- Buscar lugares cercanos, como restaurantes, tiendas, centros educativos, establecimientos de salud y puntos turísticos.
- Mantener resultados locales cuando la conexión con la API no esté disponible.
- Proteger la privacidad evitando almacenar un historial de coordenadas.

## 3. Alcance implementado

Se agregó la ruta autenticada:

```text
/ubicacion
```

La pantalla está disponible desde:

```text
Más → Ubicación y lugares
```

Las funciones implementadas son:

1. Solicitud y comprobación de permisos.
2. Obtención de una posición individual.
3. Seguimiento continuo en primer plano.
4. Visualización de latitud, longitud, precisión y hora.
5. Clasificación de la precisión.
6. Compartir o copiar la ubicación.
7. Apertura de coordenadas en OpenStreetMap.
8. Búsqueda de lugares por categoría y radio.
9. Ordenamiento por distancia.
10. Caché local de búsquedas recientes.
11. Reintento, timeout y servidor alternativo para Overpass.

## 4. Proceso de desarrollo

### 4.1 Revisión inicial

Se revisaron:

- La estructura de rutas de Angular.
- La navegación inferior de la aplicación.
- El manifiesto de Android.
- El servicio existente de conectividad.
- La configuración de Capacitor.
- Las dependencias del proyecto.

El manifiesto ya incluía permisos de ubicación utilizados anteriormente por Wi‑Fi Direct. Estos permisos se conservaron y se documentaron explícitamente para el módulo GPS.

### 4.2 Selección del proveedor GPS

Se instaló:

```text
@capacitor/geolocation 8.2.0
```

Se eligió este plugin porque proporciona:

- Integración nativa con Android.
- Solicitud de permisos en tiempo de ejecución.
- Ubicación actual mediante `getCurrentPosition`.
- Seguimiento mediante `watchPosition`.
- Compatibilidad web a través de Capacitor.

La pantalla no utiliza el plugin directamente. El acceso nativo se encuentra encapsulado en `GeolocationGateway`, lo cual reduce el acoplamiento.

### 4.3 Selección del proveedor de lugares

Se seleccionó OpenStreetMap mediante Overpass API porque:

- Utiliza datos geográficos abiertos.
- No requiere una clave privada para este alcance.
- Permite consultar nodos, vías y relaciones.
- Permite filtrar por etiquetas como `amenity`, `shop`, `tourism` e `historic`.
- Evita introducir facturación o dependencia directa de Google Maps.

### 4.4 Integración con la aplicación

Se añadió:

- Una ruta autenticada `/ubicacion`.
- Una opción en el menú “Más”.
- Una pantalla responsive para móvil, tablet y escritorio.
- Servicios de dominio, repositorios, mappers y utilidades.
- Pruebas unitarias para precisión y distancia.
- Documentación en el `README.md`.

### 4.5 Validación Android

Se ejecutaron:

```bash
npm run build
npx cap sync android
./gradlew assembleDebug
```

El APK fue instalado y ejecutado correctamente en el emulador Pixel identificado como:

```text
emulator-5554
```

## 5. Arquitectura y estructura del código

El módulo está ubicado en:

```text
src/app/core/location/
src/app/location/
```

### 5.1 Estructura

```text
core/location/
├── geolocation.gateway.ts
├── location-accuracy.util.ts
├── location-accuracy.util.spec.ts
├── location-error.mapper.ts
├── location-share.service.ts
├── location.model.ts
├── location.service.ts
├── nearby-place-cache.repository.ts
├── nearby-place.mapper.ts
└── nearby-place.repository.ts

location/
├── location.page.ts
├── location.page.html
└── location.page.scss
```

### 5.2 Responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `geolocation.gateway.ts` | Encapsula el plugin de Capacitor, permisos, posición actual y seguimiento. |
| `location.service.ts` | Orquesta ubicación, precisión, conectividad, API y caché. |
| `location.model.ts` | Define contratos de coordenadas, lugares y criterios de búsqueda. |
| `location-error.mapper.ts` | Convierte errores nativos en mensajes comprensibles. |
| `location-accuracy.util.ts` | Clasifica precisión y calcula distancias. |
| `nearby-place.repository.ts` | Consulta Overpass y administra timeout, reintento y fallback. |
| `nearby-place.mapper.ts` | Convierte la respuesta de OpenStreetMap al modelo interno. |
| `nearby-place-cache.repository.ts` | Persiste temporalmente búsquedas en `localStorage`. |
| `location-share.service.ts` | Comparte o copia el enlace de ubicación. |
| `location.page.ts` | Maneja el estado y las acciones de la interfaz. |
| `location.page.html` | Presenta coordenadas, controles y lugares. |
| `location.page.scss` | Adapta el diseño a diferentes tamaños de pantalla. |

## 6. Principios y patrones aplicados

### 6.1 Responsabilidad única

Cada clase tiene una responsabilidad concreta:

- El gateway accede al dispositivo.
- El repositorio consulta la API.
- El mapper transforma datos.
- La caché administra persistencia local.
- El servicio coordina casos de uso.
- La página controla la presentación.

### 6.2 Inversión de dependencias

La interfaz no conoce detalles de Android, OpenStreetMap ni `localStorage`. Depende de servicios de aplicación.

### 6.3 Patrón Repository

`NearbyPlaceRepository` abstrae el acceso a Overpass API y `NearbyPlaceCacheRepository` abstrae el almacenamiento local.

### 6.4 Patrón Gateway

`GeolocationGateway` actúa como frontera entre el dominio Angular y el plugin nativo.

### 6.5 Patrón Mapper

`NearbyPlaceMapper` evita que el formato de Overpass se propague a la interfaz.

### 6.6 Utilidades puras

`LocationAccuracyUtil` contiene cálculos determinísticos y verificables mediante pruebas unitarias.

## 7. Permisos y configuración Android

El archivo:

```text
android/app/src/main/AndroidManifest.xml
```

incluye:

```xml
<uses-feature
    android:name="android.hardware.location"
    android:required="false" />

<uses-feature
    android:name="android.hardware.location.gps"
    android:required="false" />

<uses-permission
    android:name="android.permission.ACCESS_FINE_LOCATION" />

<uses-permission
    android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

`ACCESS_FINE_LOCATION` permite utilizar ubicación precisa cuando el usuario la autoriza.

`ACCESS_COARSE_LOCATION` permite utilizar una ubicación aproximada.

El GPS se declaró como opcional para no impedir la instalación en dispositivos que únicamente proporcionen ubicación por red.

No se solicitó `ACCESS_BACKGROUND_LOCATION`. El seguimiento se realiza solo mientras la pantalla está abierta.

## 8. Obtención y seguimiento de ubicación

### 8.1 Configuración

Las solicitudes utilizan:

```ts
{
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 15000
}
```

### 8.2 Ubicación actual

El proceso es:

1. Consultar el estado del permiso.
2. Solicitar permiso si todavía no fue concedido.
3. Ejecutar `Geolocation.getCurrentPosition`.
4. Convertir la respuesta a `GeoPoint`.
5. Mostrar los datos en pantalla.

### 8.3 Seguimiento

El seguimiento utiliza:

```ts
Geolocation.watchPosition(...)
```

Cada actualización reemplaza la posición visible. El identificador del seguimiento se conserva para poder ejecutar:

```ts
Geolocation.clearWatch(...)
```

El seguimiento se detiene:

- Cuando el usuario pulsa “Detener”.
- Cuando abandona o destruye la pantalla.

## 9. Procesamiento de coordenadas

El modelo normalizado es:

```ts
interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}
```

La aplicación muestra:

- Latitud.
- Longitud.
- Precisión en metros.
- Clasificación de calidad.
- Hora de actualización.

Las coordenadas no se guardan como historial ni se envían a Firebase.

## 10. Verificación de precisión

La clasificación implementada es:

| Precisión reportada | Clasificación |
| --- | --- |
| Hasta 25 metros | Alta |
| De 25 a 100 metros | Media |
| Más de 100 metros | Baja |

En el emulador se configuró inicialmente:

```text
Latitud: 18.486100
Longitud: -69.931200
```

Resultado obtenido:

```text
Precisión: 5 m
Clasificación: Alta
```

Posteriormente se cambió la posición simulada a:

```text
Latitud: 18.489000
Longitud: -69.933998
```

La interfaz actualizó las coordenadas automáticamente durante el seguimiento, lo cual verificó el funcionamiento de `watchPosition`.

### 10.1 Consideración sobre el emulador

El emulador no utiliza automáticamente la posición física del usuario.

Las coordenadas anteriores fueron introducidas manualmente y corresponden aproximadamente al Distrito Nacional, cerca de las avenidas John F. Kennedy y Lope de Vega. Por esa razón los resultados mostrados no correspondían a Invivienda, Santo Domingo Este.

Para probar Invivienda debe configurarse otra posición desde Android Studio o ADB:

```bash
adb -s emulator-5554 emu geo fix LONGITUD LATITUD
```

El orden requerido por ADB es:

```text
longitud latitud
```

En un dispositivo físico, la aplicación utiliza la posición real proporcionada por Android.

## 11. Búsqueda de lugares cercanos

### 11.1 Categorías

Se implementaron:

- Todos.
- Restaurantes.
- Tiendas.
- Turismo.
- Salud.
- Educación.

### 11.2 Radios

El usuario puede elegir:

- 500 metros.
- 1 kilómetro.
- 2 kilómetros.
- 5 kilómetros.

### 11.3 Consulta Overpass

La aplicación genera consultas alrededor de las coordenadas:

```text
around:RADIO,LATITUD,LONGITUD
```

Se consultan:

- `node`
- `way`
- `relation`

Los filtros utilizan etiquetas OSM:

```text
amenity
shop
tourism
historic
```

### 11.4 Transformación de resultados

Por cada elemento se obtiene:

- Identificador.
- Nombre.
- Categoría.
- Latitud.
- Longitud.
- Dirección disponible.
- Distancia desde el usuario.

La distancia se calcula con la fórmula Haversine.

Finalmente:

1. Se eliminan resultados sin coordenadas.
2. Se ordenan por distancia.
3. Se limita la lista a 40 lugares.

## 12. Resultados de la prueba con OpenStreetMap

Con la posición simulada cercana a Lope de Vega, la API devolvió datos reales, entre ellos:

| Lugar | Categoría | Distancia |
| --- | --- | ---: |
| Colegio Saint Thomas | Educación | 42 m |
| Green | Tiendas | 78 m |
| torre Alcoy | Turismo | 95 m |
| Super Colmado Vidal | Tiendas | 104 m |
| Auto Service C&V | Tiendas | 105 m |

Los resultados aparecieron ordenados de menor a mayor distancia.

## 13. Estabilidad de conexión

### 13.1 Estrategias implementadas

La integración con Overpass incluye:

- Timeout de 18 segundos.
- Un reintento automático.
- Endpoint principal.
- Endpoint alternativo.
- Detección de conectividad.
- Recuperación desde caché local.

### 13.2 Endpoints

```text
https://overpass-api.de/api/interpreter
https://overpass.kumi.systems/api/interpreter
```

Durante las pruebas, el endpoint principal respondió correctamente. El endpoint alternativo presentó lentitud en una prueba aislada, confirmando la necesidad de timeout y caché.

### 13.3 Prueba offline

Procedimiento:

1. Realizar una búsqueda con conexión.
2. Guardar automáticamente los resultados en caché.
3. Desactivar Wi‑Fi y datos móviles del emulador.
4. Repetir la búsqueda con los mismos parámetros.

Resultado:

- La aplicación permaneció estable.
- Se conservaron los lugares encontrados.
- Se mostró la etiqueta “Caché local”.
- No se bloqueó la interfaz.

La caché se reutiliza únicamente cuando:

- Tiene menos de 15 minutos.
- La posición está a menos de 500 metros de la búsqueda anterior.
- La categoría coincide.
- El radio coincide.

## 14. Compartir ubicación

Se genera un enlace como:

```text
https://www.openstreetmap.org/?mlat=LATITUD&mlon=LONGITUD
```

La aplicación intenta utilizar:

```ts
navigator.share(...)
```

Si Web Share no está disponible, utiliza:

```ts
navigator.clipboard.writeText(...)
```

En el emulador probado no se presentó el selector nativo del WebView, por lo que se verificó correctamente el fallback del portapapeles con el mensaje:

```text
Ubicación copiada al portapapeles.
```

## 15. Privacidad y seguridad

Las decisiones tomadas fueron:

- No almacenar historial de movimientos.
- No guardar coordenadas en Firebase.
- No ejecutar seguimiento en segundo plano.
- Solicitar permisos mediante el sistema operativo.
- Compartir solo después de una acción explícita.
- Detener el seguimiento al abandonar la pantalla.
- Enviar coordenadas a Overpass únicamente cuando se solicita una búsqueda.

## 16. Diseño responsive

La interfaz se adapta mediante CSS Grid y media queries.

### Escritorio y tablet

- Coordenadas distribuidas en varias columnas.
- Acciones alineadas horizontalmente.
- Lugares distribuidos en dos columnas.

### Móvil

- Coordenadas en una columna.
- Botones apilados.
- Lugares en una columna.
- Navegación inferior accesible.

## 17. Documentación

El archivo raíz:

```text
README.md
```

documenta:

- Dependencias.
- Permisos.
- Arquitectura.
- Funciones utilizadas.
- Flujo de procesamiento.
- Precisión.
- Estabilidad.
- Privacidad.
- Procedimiento de prueba.

## 18. Validaciones realizadas

Se ejecutaron satisfactoriamente:

```bash
npx eslint src/app/core/location src/app/location
npx tsc -p tsconfig.app.json --noEmit
npx tsc -p tsconfig.spec.json --noEmit
npm run build
npx cap sync android
./gradlew :app:processDebugMainManifest
./gradlew assembleDebug
```

También se verificó:

- Instalación del APK.
- Apertura de la actividad principal.
- Permisos concedidos.
- GPS activo.
- Posición individual.
- Seguimiento continuo.
- Precisión de 5 metros en simulación.
- Consulta real a OpenStreetMap.
- Ordenamiento por distancia.
- Compartir mediante fallback.
- Recuperación desde caché sin conexión.

## 19. Conclusiones

El módulo cumple los requisitos planteados:

- Integra GPS y geolocalización nativa.
- Permite seguimiento en tiempo real.
- Declara y solicita permisos.
- Busca lugares reales mediante OpenStreetMap.
- Comparte la ubicación.
- Evalúa y muestra precisión.
- Tolera interrupciones de la API y de red.
- Utiliza caché local controlada.
- Está documentado.
- Mantiene una estructura desacoplada basada en servicios, gateway, repositorios, mapper y utilidades.

Como mejora futura se puede incorporar:

- Un mapa embebido con marcadores.
- Geocodificación inversa para mostrar el nombre del sector.
- Base de datos local IndexedDB o SQLite.
- Historial opcional con consentimiento.
- Backend propio para controlar límites y disponibilidad de Overpass.
- Pruebas instrumentadas en dispositivos físicos.
