# Diseño de datos de RuedAlerta para PostgreSQL

**Estado:** propuesta de diseño lógico y de tipos para revisión; no es una migración, un esquema físico definitivo ni una implementación. Se basa en las [decisiones acordadas](decisiones-diseno-datos.md), la [ERS](requisitos-ieee830.md), la [arquitectura](../ARCHITECTURE.md) y los [requisitos del nodo](../apps/node/docs/requisitos-nodo.md). Las decisiones funcionales allí aprobadas prevalecen sobre cualquier propuesta de este documento. El firmware, broker, backend y base de datos aún no están implementados ni probados.

El objetivo es identificar las entidades, relaciones, restricciones y operaciones necesarias para el MVP. Los nombres y tipos propuestos pueden cambiar tras revisar el contrato MQTT, la versión de PostgreSQL, la autenticación y los mecanismos de envío y almacenamiento.

## 1. Alcance y convenciones propuestas

- Una base PostgreSQL por instalación autogestionada; no se propone una entidad de organización ni usuarios compartidos entre instalaciones.
- Nombres de tablas y columnas en inglés y `snake_case`; explicaciones en español. Las claves internas se indican como `id`, las referencias como `*_id`.
- Se acordó usar `uuid` para las identidades internas de usuarios, vehículos, nodos, contactos y solicitudes, y para el ID estable del evento generado por el nodo. La generación segura en ESP32, versión y ámbito definitivo del UUID de evento siguen pendientes.
- `timestamptz` para instantes; `text` para cadenas; `boolean` para condiciones binarias; coordenadas en `numeric` con precisión pendiente. `NULL` significa información opcional o desconocida, no cero ni fecha inventada.
- `PK` = clave primaria, `FK` = clave foránea; `?` = campo opcional. Las listas de estados y sus transiciones son **propuestas**, no una selección final de enums de PostgreSQL.
- Los archivos de imagen permanecen fuera de la base. No se guardan lecturas continuas de sensores. La base no almacena por defecto las contraseñas MQTT en texto plano.

## 2. Relaciones principales

El [diagrama entidad-relación](diagrama-entidad-relacion.md) reúne las entidades, atributos principales y cardinalidades, incluidas las sesiones acordadas.

Las asociaciones de usuario/vehículo/nodo y las operaciones se validan para impedir acceso cruzado. El diagrama describe cardinalidades orientativas; no sustituye los controles de autorización ni garantiza consistencia por sí solo.

## 3. Identidad y acceso

| Tabla propuesta | Columnas principales | Responsabilidad y límites |
|---|---|---|
| `users` | `id` PK, `first_name`, `last_name`, `email`, `phone`, `national_id`?, `password_hash`, `email_verified_at`?, `account_status`, `created_at` | Correo y teléfono obligatorios y únicos por instalación; teléfono con código de país. Cédula opcional y única cuando existe. Contraseña con hash, nunca texto plano. Correo comparado sin distinguir mayúsculas y sin espacios en extremos; teléfono con `+`, código de país y dígitos sin espacios ni guiones; cédula, si existe, de 10 dígitos como texto. Estados y otras validaciones pendientes. |
| `sessions` | `id` PK, `user_id` FK, `status`, `created_at`, `expires_at`, `revoked_at`? | Registro por sesión acordado para gestionar renovación y revocación. El token de acceso es JWT; formato y protección del token de renovación, duración y mecanismo de revocación del acceso pendientes. |
| `account_tokens` | `id` PK, `user_id` FK, `purpose`, `token_hash`, `expires_at`, `used_at`?, `created_at` | Propuesta para verificar correo y recuperar contraseña. Solo se guarda un hash de token, no el enlace secreto. Vigencia, revocación y mecanismo siguen pendientes; no se interpreta esta expiración como TTL de eventos. |
| `account_deletion_jobs` | `id` PK, `user_id` FK?, `status`, `created_at`, `completed_at`?, `last_error_code`? | Proceso persistente de eliminación y coordinación con broker y almacenamiento. Debe poder completar limpieza con datos mínimos aun cuando se borre la cuenta; diseño de referencias y estado final pendiente. No guardar secretos ni datos sensibles en errores. |
| `device_revocation_jobs` | `id` PK, `deletion_job_id` FK, `registration_id` FK?, `broker_identity_ref`, `status`, `retry_count`, `next_attempt_at`? | Propuesta para reintentar y confirmar revocación por nodo. `broker_identity_ref` no contiene la contraseña. Retención, manejo de sesiones activas y fallos permanentes pendientes. |

No se añade una tabla de roles administrativos de la aplicación para el MVP. Se acordaron un JWT de acceso, un token de renovación y un registro persistente por sesión. La duración, el formato y almacenamiento seguro del token de renovación, la rotación y la revocación del JWT de acceso ya emitido siguen pendientes. El backend debe verificar propiedad en todas las operaciones; que un usuario esté autenticado o conozca una URL no concede acceso a datos ajenos. No se asume que el operador de la infraestructura carezca de acceso técnico a los datos.

## 4. Vehículos, marcas e imágenes

| Tabla propuesta | Columnas principales | Responsabilidad y límites |
|---|---|---|
| `vehicle_brands` | `id` PK, `name`, `created_by_user_id` FK?, `created_at` | Catálogo compartido dentro de la instalación. Los usuarios crean marcas; no se permite editar/eliminar entradas usadas por otras personas. La propiedad de la entrada, tratamiento al borrar su creador y control de duplicados están pendientes. |
| `vehicle_models` | `id` PK, `brand_id` FK, `name`, `created_by_user_id` FK?, `created_at` | Cada modelo pertenece a una sola marca. Reglas de edición y duplicados pendientes. |
| `vehicles` | `id` PK, `owner_user_id` FK, `alias`, `vehicle_type`, `plate`?, `plate_normalized`?, `brand_id` FK?, `model_id` FK?, `retired_at`?, `created_at` | Tipo bicicleta/motocicleta; placa opcional, marca/modelo opcionales; modelo solo con marca correspondiente. Retiro preserva historia. Si el alias es obligatorio, su validación exacta se confirmará antes de migrar. |
| `vehicle_photos` | `id` PK, `vehicle_id` FK, `storage_url`, `content_type`, `size_bytes`, `is_primary`, `created_at` | Cero a diez JPEG/PNG, hasta 10 MB por archivo; `storage_url` es referencia estable, no permiso de acceso. Al borrar la principal se selecciona la restante más antigua; sin fotos no hay principal. Unidad exacta MB y desempate pendiente. |

**Reglas de integridad:**

1. La placa se compara ignorando mayúsculas, espacios y guiones. Se propone índice único parcial sobre la representación normalizada solo para vehículos no retirados con placa presente; ausencia de placa no entra en la unicidad. La sincronización entre `plate` y `plate_normalized` debe estar garantizada por la implementación, no solo por el frontend. La semántica entre jurisdicciones queda pendiente. [PostgreSQL: índices parciales](https://www.postgresql.org/docs/current/indexes-partial.html).
2. Una FK compuesta o diseño equivalente debe impedir que un vehículo seleccione un modelo de otra marca; el `CHECK` por sí solo no verifica otra tabla. Modelo ausente permite marca ausente o presente.
3. Índice único parcial por `vehicle_id` con `is_primary = true` asegura **como máximo** una principal; no garantiza que exista una cuando hay fotos. La operación transaccional debe asegurar el límite de diez y seleccionar sucesora bajo bloqueo por vehículo, incluyendo cargas y borrados concurrentes. Desempate si las fechas coinciden: pendiente.
4. Subir o borrar un archivo y confirmar su registro en PostgreSQL son operaciones en sistemas distintos; se requieren compensaciones y un proceso de limpieza pendientes. El bucket y sus URL no deben ser públicamente legibles por defecto.

## 5. Dispositivos, propiedad y contactos

| Tabla propuesta | Columnas principales | Responsabilidad y límites |
|---|---|---|
| `devices` | `id` PK, `device_identifier` UNIQUE, `created_at` | Identidad estable del nodo físico, distinta de cuenta, alias y credenciales. Aprovisionamiento, reemplazo y prueba de posesión pendientes. |
| `device_registrations` | `id` PK, `device_id` FK, `owner_user_id` FK, `alias`?, `registered_at`, `ended_at`?, `connectivity_state`, `last_seen_at`?, `contacts_desired_revision`, `contacts_applied_revision`? | Representa un período de propiedad/vinculación y distingue reaprovisionamientos. Como máximo un registro activo por dispositivo. Propiedad y transición entre propietarios pendientes. Las revisiones son propuesta para mostrar sincronización; su protocolo exacto no está elegido. |
| `device_credentials` | `id` PK, `registration_id` FK, `broker_identity_ref`, `status`, `created_at`, `revoked_at`? | Metadatos mínimos de la identidad MQTT; mecanismo real de autenticación y lugar de custodia de secretos pendientes. Tras una nueva vinculación deben emitirse credenciales nuevas. |
| `vehicle_assignments` | `id` PK, `registration_id` FK, `vehicle_id` FK, `started_at`, `ended_at`? | Historial de asociación. Como máximo una asociación activa por registro de nodo y una por vehículo. Ambos deben pertenecer al mismo propietario. Preserva la identidad de la asociación usada por cada evento. |
| `emergency_contacts` | `id` PK, `owner_user_id` FK, `first_name`, `last_name`, `email`, `phone`, `national_id`?, `created_at` | Todos los campos salvo cédula son obligatorios; la cédula presente tiene 10 dígitos como texto y el teléfono usa `+`, código de país y dígitos. Correo, teléfono y cédula presente no se repiten dentro de la lista del mismo usuario; reglas restantes de comparación y validación pendientes. |
| `device_contacts` | `registration_id` FK, `contact_id` FK, `created_at` | PK compuesta `(registration_id, contact_id)`. Contacto y registro deben pertenecer al mismo usuario; un nodo puede tener cero o varios contactos y un contacto puede asignarse a varios nodos del propietario. |

Propuesta PostgreSQL: índices únicos parciales para registros y asociaciones activas (`ended_at IS NULL`). La correspondencia de propietario entre registros relacionados debe garantizarse mediante FK compuestas o transacciones con controles adecuados; una FK simple al ID no impide por sí sola vincular recursos de otro usuario. Una consulta autorizada del backend sigue siendo obligatoria. Los índices históricos por período se evaluarán según consultas y reglas de concurrencia.

**Barrera de reasignación:** no basta consultar una cola vacía. Debe existir un protocolo coordinado y persistente que cierre la generación bajo la asociación anterior, sincronice y confirme pendientes, confirme el cambio y reanude bajo la nueva asociación. La elección de un identificador de época y los estados concretos quedan pendientes. Sin esa garantía no se puede cerrar la atribución histórica de eventos offline.

## 6. Eventos, ubicación y notificaciones

| Tabla propuesta | Columnas principales | Responsabilidad y límites |
|---|---|---|
| `events` | `id` PK, `registration_id` FK, `device_event_id` UUID, `assignment_id` FK?, `event_type`, `occurred_at`?, `time_confidence`, `received_at`, `latitude`?, `longitude`?, `location_observed_at`? | `UNIQUE(registration_id, device_event_id)` para evitar duplicados del mismo registro; contrato de identidad persistente, reinicio y reaprovisionamiento pendiente. Debe conservar la asociación vigente al ocurrir, no inferirla por recepción. Si puede haber eventos sin vehículo, su tratamiento sigue pendiente. |
| `deleted_event_markers` | `registration_scope`, `device_event_id`, `deleted_at` | Marca mínima y única para impedir recreación tras borrado. Se conserva mientras sea posible aceptar un reenvío y solo se elimina con evidencia confiable de que ya no puede aceptarse; el ámbito, prueba de eliminación segura y tratamiento de cuenta eliminada deben definirse sin mantener datos de usuario innecesarios; no hay FK obligatoria a una cuenta ya eliminada. Confirmar la coherencia de su clave con la unicidad de `events`. |
| `location_requests` | `id` PK, `registration_id` FK, `requested_by_user_id` FK, `requested_at`, `status`, `responded_at`?, `latitude`?, `longitude`?, `location_observed_at`? | Solicitud correlacionada; estado e información disponible sin inventar ubicación. Solicitud y respuesta se conservan hasta que el usuario decida eliminarlas; política offline, vigencia, respuestas tardías y eliminación de cuenta pendientes. Si una ubicación requiere múltiples respuestas se ajustará el modelo. |
| `notification_attempts` | `id` PK, `event_id` FK, `contact_id` FK?, `channel`, `attempt_key`, `attempted_at`?, `received_at`?, `result_status`, `result_code`? | Registro individual de intentos por contacto y canal. `contact_id` nullable tras borrado; no conservar copia de nombre, cédula, teléfono o correo en el intento. `attempt_key` debe permitir idempotencia y diferenciar reintentos, también si se originan offline. Estados reales y evidencia de entrega dependen del canal. |
| `notification_outbox` | `id` PK, `event_id` FK, `contact_id` FK?, `channel`, `status`, `created_at` | Propuesta de trabajo durable para intentos de correo tras persistir el evento, evitando perder el envío si falla el proceso. Políticas de idempotencia, destinatarios vigentes y cancelación quedan por diseñar; no es evidencia de entrega. |

No se propone conservar una instantánea de datos personales del contacto dentro de los intentos: al eliminarlo, la referencia se anula y los intentos permanecen sin datos personales. El backend tendrá que evitar datos sensibles en códigos o errores. Para informes de SMS offline que lleguen después de borrar un contacto, hace falta una referencia opaca y una regla de conciliación que no restaure su identidad; el contrato y su retención aún no están cerrados.

Si falla la red celular, el nodo conserva los SMS pendientes y los reintenta al recuperar cobertura; el límite y tratamiento de respuestas ambiguas siguen pendientes. Correo usa contactos vigentes al procesar el evento; SMS usa la última lista del nodo y puede incluir un contacto retirado mientras no se sincronice. La marca del evento eliminado debe impedir su recreación y efectos secundarios aunque se vuelva a recibir, y manejar la confirmación al nodo según contrato por definir.

## 7. Reglas de borrado y consistencia

Los eventos no tendrán TTL: permanecerán hasta que el propietario los elimine o se aplique el proceso de eliminación de la cuenta.

| Operación | Comportamiento esperado | Mecanismo por diseñar |
|---|---|---|
| Retirar vehículo | Mantener su historial y liberar su placa para nuevos vehículos activos. | Mantener registro histórico y FKs; no reasignar eventos al nuevo vehículo. |
| Borrar contacto | Retirar asignaciones y eliminar datos personales; conservar intentos previos sin datos del contacto. | Anular referencia y limpiar información en errores/colas, considerar nodo con lista antigua. |
| Borrar evento | Eliminar evento e intentos relacionados; crear marca mínima; no restaurarlo por reintentos. | Crear marca y eliminar en una transacción; coordinar outbox y envíos en curso. No garantizar revocación retroactiva de SMS/correos ya enviados. |
| Eliminar cuenta | Tras confirmación, bloquear acceso y procesamiento, persistir tarea y revocar MQTT con reintentos; una vez confirmado, eliminar datos y desvincular. | Diseñar máquina de estados, coordinación entre broker/BD/bucket, sesión activa, operaciones idempotentes y eliminación de fotos y solicitudes. |

En cuenta pendiente se rechazan nuevos eventos y acciones; si el broker es inaccesible no se puede asegurar la revocación y el proceso no se declara completo. Las decisiones sobre respaldos, restauración y fallos permanentes quedan pendientes o fuera del MVP. La eliminación en la base activa no implica borrado inmediato en respaldos o mensajes ya enviados.

## 8. Consultas e índices iniciales propuestos

Además de PK, FK y restricciones de unicidad que realmente se implementen, considerar índices para: vehículos y nodos por propietario, historial de eventos por registro y fecha de recepción, solicitudes de ubicación por nodo y fecha, intentos por evento, y trabajos pendientes por estado y próximo reintento. La selección concreta, orden de columnas y necesidad de cada índice se verificará con las consultas reales y `EXPLAIN`; no se propone particionamiento, clúster ni extensiones sin una necesidad medida.

## 9. Casos de verificación antes de implementar

1. Aislamiento: A no puede leer, modificar ni descargar fotos de B ni crear una asignación con recursos de otro usuario.
2. Unicidad: correo, teléfono y cédula presente por instalación; placas normalizadas únicas entre vehículos activos, ausentes repetibles y reutilizables tras retiro.
3. Relaciones: modelo corresponde a marca; un nodo y vehículo tienen como máximo una asignación activa; no crear contactos cruzados.
4. Fotos: cero a diez, tamaño y formato validados, una principal si hay fotos, reemplazo de la más antigua y solicitudes concurrentes.
5. Eventos: escritura local antes de MQTT, confirmación solo tras commit, reenvío no duplica evento ni aviso; fecha desconocida y ubicación ausente no se inventan.
6. Reasignación: desconectado bloquea cambio; simular un evento durante la transición y preservar el vehículo original incluso con hora no confiable.
7. Avisos: SMS sin MQTT usa última lista confirmada; correo tardío usa contactos vigentes; registrar intentos por canal y contacto sin asegurar entrega.
8. Eliminación: contacto eliminado deja intentos sin datos personales; evento borrado no reaparece al reenviarlo; cuenta pendiente no procesa eventos y revocación se reintenta con broker fuera de línea.

Estas son pruebas propuestas, no ejecutadas. Deben complementarse con los [diez escenarios del proyecto](escenarios-de-prueba.md).

## 10. Decisiones pendientes para aprobar implementación

- Versión de PostgreSQL, ORM o acceso SQL, estrategia de migraciones e identidades efectivas.
- Detalles de validación aún no acordados y liberación o reutilización de identificadores tras borrar cuentas; las reglas aceptadas se recogen en el diagrama y decisiones de datos.
- Proveedor SMTP y mecanismos de verificación, recuperación y seguridad de sesiones y renovación; sin fijar RLS ni un proveedor de identidad.
- Aprovisionamiento, transferencia y seguridad de nodos; barrera de reasignación y garantías ante eventos y borrados concurrentes.
- Contrato MQTT/SMS: generación y ámbito de IDs, estado de sincronización, validez de hora, reintentos, resultados inciertos y reconciliación de contactos borrados.
- Mecanismo y condición de eliminación segura de marcas, trabajos de correo y revocación; eliminación de solicitudes de ubicación, mensajes ya enviados y acciones en curso.
- Proveedor de imágenes privado, ubicación estable, límites precisos, limpieza y protección de archivos.
- Módem, SIM, operadora, cobertura y costes; configuración de correo; viabilidad de ECU 911. Nada de esto garantiza entrega.

## Referencias técnicas

- [PostgreSQL: restricciones de integridad](https://www.postgresql.org/docs/current/ddl-constraints.html).
- [PostgreSQL: índices parciales y únicos](https://www.postgresql.org/docs/current/indexes-partial.html).
