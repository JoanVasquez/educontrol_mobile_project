# Guia del codigo del proyecto

Esta guia explica la estructura principal de la app sin llenar el codigo con comentarios repetidos. Los comentarios dentro de los archivos se reservan para reglas de negocio, decisiones offline-first, seguridad y flujos que no son evidentes al leer una funcion.

## Capas principales

- `src/app/core`: contiene la logica de dominio, repositorios, mappers, servicios de Firebase, cache local, sincronizacion offline y reglas compartidas.
- `src/app/shared`: contiene componentes reutilizables de UI.
- `src/app/<feature>`: contiene paginas y componentes especificos de cada flujo visual, como estudiantes, docentes, asistencia, averias y ubicacion.
- `documentacion`: contiene guias tecnicas y notas de arquitectura para entender decisiones del proyecto.

## Patrones usados

- `Repository`: encapsula lectura/escritura de Firebase, cache local o cola pendiente.
- `Facade`: conecta paginas con servicios y mantiene el componente visual simple.
- `Mapper`: transforma datos entre Firestore, modelos de dominio y objetos de UI.
- `Presenter`: convierte resultados tecnicos en textos o estados listos para la pantalla.
- `Factory`: construye comandos o drafts complejos desde formularios.
- `Offline-first`: guarda localmente cuando no hay internet y sincroniza al recuperar conexion.

## Flujos de negocio

- Estudiantes: se registran con datos academicos, curso y asignaturas segun catalogo dominicano. El cambio de curso se guarda localmente si no hay internet y luego se sincroniza.
- Docentes: se registran con asignaturas y cursos asignados. La clave por defecto solo se usa internamente para crear la cuenta y no se muestra en UI.
- Asistencia: el docente solo puede pasar lista en cursos/asignaturas permitidas. Si no hay internet, la asistencia queda en cola local.
- Averias: se reportan con categoria, prioridad, ubicacion y foto opcional. Los reportes pendientes se sincronizan cuando vuelve la conexion.
- Ubicacion: obtiene coordenadas, calcula precision, busca lugares cercanos y cachea resultados para uso offline.

## Reglas de mantenimiento

- Mantener archivos bajo 140 lineas cuando sea posible.
- Preferir comentarios que expliquen el por que, no el que obvio.
- Mantener mensajes de usuario independientes de si la accion fue local o Firebase.
- No exponer secretos, claves por defecto ni detalles internos en pantallas.
- Reutilizar utils, mappers y presenters antes de duplicar reglas.
