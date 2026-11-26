# Diagrama entidad-relación de RuedAlerta

**Estado:** diseño lógico propuesto para revisión; no representa tablas implementadas, una migración ni un esquema físico definitivo. Complementa el [diseño de base de datos](diseno-base-datos.md) y las [decisiones acordadas](decisiones-diseno-datos.md). Los nombres de tablas y columnas son propuestas. Las credenciales, la vinculación y la sincronización offline requieren contratos aún por definir.

El diagrama describe relaciones y atributos principales. No representa todas las restricciones, reglas de seguridad o estados del sistema; estas se documentan debajo. `PK` indica clave primaria y `FK` clave foránea. El signo `o` en una relación indica participación opcional, no que todos los atributos de esa entidad sean opcionales.

```mermaid
erDiagram
    users ||--o{ sessions : has
    users ||--o{ account_tokens : receives
    users ||--o{ vehicles : owns
    users ||--o{ device_registrations : owns
    users ||--o{ emergency_contacts : owns
    users ||--o{ location_requests : requests
    users o|--o{ account_deletion_jobs : initiates
    vehicle_brands ||--o{ vehicle_models : includes
    vehicle_brands o|--o{ vehicles : classifies
    vehicle_models o|--o{ vehicles : classifies
    vehicles ||--o{ vehicle_photos : has
    devices ||--o{ device_registrations : has
    device_registrations ||--o{ device_credentials : uses
    device_registrations ||--o{ vehicle_assignments : has
    vehicles ||--o{ vehicle_assignments : assigned_to
    device_registrations ||--o{ device_contacts : selects
    emergency_contacts ||--o{ device_contacts : selected
    device_registrations ||--o{ events : generates
    vehicle_assignments o|--o{ events : provides_context
    device_registrations ||--o{ location_requests : receives
    events ||--o{ notification_attempts : has
    emergency_contacts o|--o{ notification_attempts : recipient
    events ||--o{ notification_outbox : queues
    emergency_contacts o|--o{ notification_outbox : recipient
    account_deletion_jobs ||--o{ device_revocation_jobs : includes
    device_registrations o|--o{ device_revocation_jobs : revokes

    users {
        uuid id PK
        text first_name
        text last_name
        text email
        text phone
        text national_id
        text password_hash
        timestamptz email_verified_at
        text account_status
        timestamptz created_at
    }
    sessions {
        uuid id PK
        uuid user_id FK
        text status
        timestamptz created_at
        timestamptz expires_at
        timestamptz revoked_at
    }
    account_tokens {
        uuid id PK
        uuid user_id FK
        text purpose
        text token_hash
        timestamptz expires_at
        timestamptz used_at
    }
    vehicles {
        uuid id PK
        uuid owner_user_id FK
        uuid brand_id FK
        uuid model_id FK
        text alias
        text vehicle_type
        text plate
        text plate_normalized
        timestamptz retired_at
    }
    vehicle_brands {
        uuid id PK
        text name
        uuid created_by_user_id FK
    }
    vehicle_models {
        uuid id PK
        uuid brand_id FK
        text name
        uuid created_by_user_id FK
    }
    vehicle_photos {
        uuid id PK
        uuid vehicle_id FK
        text storage_url
        text content_type
        bigint size_bytes
        boolean is_primary
        timestamptz created_at
    }
    devices {
        uuid id PK
        text device_identifier UK
        timestamptz created_at
    }
    device_registrations {
        uuid id PK
        uuid device_id FK
        uuid owner_user_id FK
        text alias
        timestamptz registered_at
        timestamptz ended_at
        text connectivity_state
        timestamptz last_seen_at
        bigint contacts_desired_revision
        bigint contacts_applied_revision
    }
    device_credentials {
        uuid id PK
        uuid registration_id FK
        text broker_identity_ref
        text status
        timestamptz revoked_at
    }
    vehicle_assignments {
        uuid id PK
        uuid registration_id FK
        uuid vehicle_id FK
        timestamptz started_at
        timestamptz ended_at
    }
    emergency_contacts {
        uuid id PK
        uuid owner_user_id FK
        text first_name
        text last_name
        text email
        text phone
        text national_id
    }
    device_contacts {
        uuid registration_id PK,FK
        uuid contact_id PK,FK
        timestamptz created_at
    }
    events {
        uuid id PK
        uuid registration_id FK
        uuid device_event_id
        uuid assignment_id FK
        text event_type
        timestamptz occurred_at
        text time_confidence
        timestamptz received_at
        numeric latitude
        numeric longitude
        timestamptz location_observed_at
    }
    deleted_event_markers {
        text registration_scope PK
        uuid device_event_id PK
        timestamptz deleted_at
    }
    location_requests {
        uuid id PK
        uuid registration_id FK
        uuid requested_by_user_id FK
        text status
        timestamptz requested_at
        timestamptz responded_at
        numeric latitude
        numeric longitude
        timestamptz location_observed_at
    }
    notification_attempts {
        uuid id PK
        uuid event_id FK
        uuid contact_id FK
        text channel
        text attempt_key
        text result_status
        timestamptz attempted_at
        timestamptz received_at
    }
    notification_outbox {
        uuid id PK
        uuid event_id FK
        uuid contact_id FK
        text channel
        text status
        timestamptz created_at
    }
    account_deletion_jobs {
        uuid id PK
        uuid user_id FK
        text status
        timestamptz created_at
        timestamptz completed_at
    }
    device_revocation_jobs {
        uuid id PK
        uuid deletion_job_id FK
        uuid registration_id FK
        text broker_identity_ref
        text status
        int retry_count
        timestamptz next_attempt_at
    }
```

## Cómo interpretar las relaciones

- **Usuario y acceso:** una cuenta tiene cero o más sesiones; el registro de sesión permite gestionar la renovación y revocación. El token de acceso es JWT y existe un token de renovación, cuyo formato, duración, rotación y almacenamiento siguen pendientes. Revocar la renovación no invalida automáticamente un JWT de acceso ya emitido.
- **Vehículo y nodo:** un usuario puede tener varios de cada uno. `vehicle_assignments` conserva las asociaciones históricas; solo puede haber una asociación activa por nodo y por vehículo. Los eventos conservarán el vehículo asociado cuando ocurrieron. La barrera para eventos concurrentes durante una reasignación está pendiente.
- **Catálogo:** las marcas y modelos son compartidos en una instalación; cada modelo pertenece a una marca. Los vehículos y fotos siguen siendo privados. `created_by_user_id` es opcional en la propuesta; el tratamiento al borrar al creador todavía debe definirse.
- **Contactos:** cada contacto pertenece a un usuario y se relaciona con sus nodos mediante `device_contacts`. Cada nodo puede tener cero contactos; los datos del contacto no se conservan en intentos históricos tras su eliminación.
- **Eventos y avisos:** el UUID de evento se genera en el nodo y se mantiene en reintentos. Cada intento pertenece a un evento y conserva su contacto solo mientras exista. El correo y el SMS pueden tener destinatarios distintos si cambió la lista durante una desconexión.
- **Marca de evento eliminado:** `deleted_event_markers` se muestra sin relación física fijada porque el ámbito y las claves para sobrevivir a eliminación o reaprovisionamiento aún no están cerrados. Se conserva mientras el evento pueda reenviarse y solo podrá retirarse cuando haya evidencia de que ya no puede aceptarse.
- **Ubicación:** las solicitudes y respuestas se guardan por separado de los eventos y se conservan hasta que el usuario decida eliminarlas; los detalles de respuesta tardía y eliminación de cuenta quedan pendientes.
- **Eliminación de cuenta:** los trabajos de borrado y revocación son una propuesta lógica para que la eliminación permanezca pendiente hasta confirmar la revocación MQTT. Las referencias opcionales y la limpieza deben diseñarse sin conservar datos personales innecesarios.

## Reglas que no expresa Mermaid

1. Usuario: nombres, apellidos, correo y teléfono obligatorios; cédula opcional de 10 dígitos. Correo, teléfono y cédula presente son únicos por instalación. El teléfono incluye `+` y código de país; el correo se compara sin distinguir mayúsculas y sin espacios en los extremos.
2. Contacto: nombres, apellidos, correo y teléfono obligatorios; cédula opcional de 10 dígitos. Correo, teléfono y cédula presente no se repiten dentro de la lista del mismo propietario. El teléfono usa el mismo formato internacional. Las reglas de comparación del correo del contacto y validación de cédulas siguen pendientes.
3. Vehículo: marca y modelo son opcionales, pero si existe modelo debe corresponder a la marca. La placa es opcional y única entre vehículos activos al compararla sin mayúsculas, espacios ni guiones; puede reutilizarse tras el retiro.
4. Fotos: cero a diez JPEG o PNG de hasta 10 MB; si hay fotos, una es principal. Al borrarla, la foto restante más antigua pasa a ser principal. Acceso solo a usuarios autenticados y autorizados como propietarios, incluso al abrir directamente la URL. Concurrencia y desempate siguen pendientes.
5. Eventos: sin TTL; el usuario puede eliminarlos y también se eliminan sus intentos de aviso. La marca mínima evita que un reenvío los recree. La unicidad concreta del UUID por nodo o registro se cerrará junto con el contrato MQTT y el reaprovisionamiento.
6. Integridad y acceso: cada operación debe comprobar que los registros relacionados pertenecen al usuario correcto. PK/FK simples por sí solas no sustituyen esta autorización. Los índices, restricciones, `NULL`, tipos definitivos y comportamiento de borrado se detallarán en la migración posterior.

## Pendientes para pasar al esquema físico

Selección de versión de PostgreSQL y ORM; detalles de UUID en ESP32; nulabilidad, tipos y restricciones definitivas; gestión de sesiones y secretos de renovación; política de formatos; protocolo de reasignación, sincronización de contactos e intentos SMS; ámbito de las marcas y su compatibilidad con eliminación de cuentas; identificadores de destinatarios anonimizados; almacenamiento privado de fotos y limpieza; manejo de accesos y borrados concurrentes. Nada de lo anterior está implementado o verificado.
