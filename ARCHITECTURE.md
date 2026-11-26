# Arquitectura inicial de RuedAlerta

**Estado:** propuesta inicial para revisión. La problemática y los límites del proyecto están en [problem-statement.md](docs/problem-statement.md); los flujos funcionales, en [casos-de-uso.md](docs/casos-de-uso.md).

## Alcance

Una instalación autogestionada admitirá varios usuarios y varios nodos por usuario. Cada nodo corresponde al prototipo instalado en una bicicleta o motocicleta. La primera versión tendrá **un broker MQTT, un backend, un frontend y una base de datos**. El backend se plantea como una aplicación monolítica; los demás componentes son procesos o servicios separados. No se propone un clúster ni un API Gateway para esta etapa.

```text
Nodos de bicicletas y motocicletas
          ↕ MQTT
    Eclipse Mosquitto (uno)
          ↕ MQTT
 Backend NestJS/TypeScript ↔ PostgreSQL
          ↕ API
      Frontend Next.js
          ↕
       Usuarios
```

El correo, la red celular para SMS, el almacenamiento externo de imágenes y ECU 911 son externos al diagrama. El proveedor de correo, módem y almacenamiento no se han seleccionado. La integración directa con ECU 911 sigue sujeta a validación y no se presupone disponible.

## Tecnologías seleccionadas

- **Backend:** NestJS con TypeScript, organizado inicialmente como un monolito.
- **Frontend:** Next.js con TypeScript y App Router, inicializado en `apps/frontend/`. Los detalles de implementación se definirán más adelante.
- **Base de datos:** PostgreSQL.
- **Broker MQTT:** Eclipse Mosquitto.

El frontend está inicializado; el backend, el broker y la base de datos aún no están implementados en el repositorio. El mecanismo de despliegue continúa pendiente.

## Responsabilidades

| Componente | Responsabilidad prevista |
|---|---|
| Nodo | Detectar eventos, persistirlos y comunicarse por MQTT mediante Wi-Fi; intentará SMS mediante módem y red celular independientes del broker. El hardware celular aún no está seleccionado. |
| Broker | Distribuir mensajes MQTT entre nodos y backend; autenticar y restringir acceso a temas según la implementación elegida. |
| Backend | Gestionar usuarios, vinculación y permisos de nodos, procesar eventos, solicitudes de ubicación y notificaciones, y ofrecer una API al frontend. |
| Base de datos | Almacenar usuarios, nodos, asociaciones, contactos, eventos y estados necesarios; esquema y políticas de retención distintas de eventos pendientes. |
| Frontend | Permitir gestionar nodos y contactos, solicitar ubicación y consultar eventos y alertas autorizados. |

El backend es el consumidor previsto de los mensajes y responsable de persistir los datos de aplicación; no se ha decidido una conexión directa broker-base de datos. Node-RED y los componentes de sensores del planteamiento original son alternativas por evaluar, no partes obligatorias de este diseño.

## Flujos principales

**Evento:** el nodo detecta movimiento no autorizado, impacto o caída → asigna un ID estable y guarda el evento en flash → lo publica mediante MQTT → el backend lo registra de forma idempotente en PostgreSQL → tras confirmar la transacción, envía una confirmación de aplicación → el nodo libera el evento al validar la confirmación. Según el evento y la configuración, el backend gestiona la notificación. Los contactos y el canal hacia ECU 911 son externos y su entrega no está garantizada.

**Ubicación solicitada:** el usuario solicita coordenadas desde el frontend → el backend comprueba permisos y registra una solicitud con identificador y estado → la publica al nodo mediante el broker → el nodo responde vinculando su respuesta a ese identificador → el backend registra y presenta el resultado disponible. Debe identificarse una ubicación antigua o no disponible; el comportamiento exacto está pendiente.

## Interfaces y límites de responsabilidad

| Límite | Comunicación prevista | Responsabilidad y decisión pendiente |
|---|---|---|
| Nodo ↔ broker | MQTT a través de una red disponible | El nodo publica eventos y recibe solicitudes. Cada nodo tendrá identidad y credenciales propias revocables; los temas, versión de MQTT, QoS y política de sesión están pendientes. |
| Broker ↔ backend | MQTT | El backend consume eventos y publica solicitudes. La correlación usa el ID de solicitud; los eventos se deduplican por nodo e ID de evento. Formatos y validación detallada están pendientes. |
| Frontend ↔ backend | API; protocolo y contrato por definir | El backend deberá comprobar la identidad y permisos; ocultar datos en la interfaz no constituye autorización. |
| Backend ↔ PostgreSQL | Conexión de aplicación a base de datos | El backend es responsable previsto de persistir datos; esquema, migraciones y política de retención aún no están definidos. |
| Backend ↔ canales externos | Correo y almacenamiento de imágenes por definir | El backend intentará correos y controlará acceso a fotos privadas; proveedores y confirmación de entrega están pendientes. |
| Nodo ↔ red móvil | SMS mediante módem y SIM por seleccionar | Intentará SMS a contactos locales para los tres eventos; cobertura y servicio necesarios, sin garantía de entrega. |

Estas interfaces describen el diseño previsto: no implican que existan contratos implementados ni garantías de entrega. Los requisitos relacionados se encuentran en la [ERS](docs/requisitos-ieee830.md).

## Datos y permisos previstos

Una instalación admitirá varios usuarios y varios nodos por usuario. Cada nodo físico tendrá un identificador único y un solo propietario a la vez. El vehículo es una entidad diferenciada: el nodo podrá reasignarse a otro vehículo. La primera versión no permitirá compartir nodos: el backend comprobará que el usuario sea propietario antes de consultar o actuar sobre uno. El registro y la transferencia de propiedad siguen pendientes.

Las personas se registrarán e iniciarán sesión con correo y contraseña; deberán verificar el correo antes de utilizar la cuenta y podrán recuperar la contraseña mediante un enlace enviado por correo. Las contraseñas no se almacenarán en texto plano. No habrá rol de administrador en la aplicación en la primera versión; la administración técnica de la instalación es una responsabilidad distinta y no implica privacidad frente a quien controle la infraestructura. Proveedor de correo, sesiones y mecanismos de verificación y recuperación siguen pendientes.

Cada usuario mantendrá su lista de contactos de emergencia y seleccionará qué contactos propios se asignan a cada nodo. Un contacto podrá utilizarse en varios nodos, sin duplicar sus datos.

Se guardarán eventos, no lecturas continuas de sensores. Cada evento tendrá identidad de nodo e ID de evento estable, tipo, instante de ocurrencia cuando sea confiable, instante de recepción en el servidor y, cuando estén disponibles, ubicación e instante de obtención. Los reintentos usarán la misma identidad y el backend evitará duplicados por la combinación nodo + ID de evento. La confirmación MQTT del broker no demuestra que PostgreSQL haya guardado el evento. Cada evento conservará el vehículo asociado en el momento en que ocurrió, aunque el nodo se reasigne posteriormente.

Se mantendrán el estado actual conocido del nodo y la última comunicación observada, sin historial de conexiones en la etapa inicial. Las solicitudes de ubicación son independientes de los eventos y tendrán identidad, estado y respuesta registrados. Se almacenarán también usuarios, vehículos, asociaciones y contactos según el modelo que se diseñe. Los eventos no tendrán TTL y se conservarán hasta que el usuario los elimine; estructura de tablas, marcas mínimas de borrado, eliminación de cuenta y reglas para ubicación antigua o ausente requieren diseño detallado.

Cada nodo utilizará credenciales propias y revocables y acceso mínimo por tema; el backend tendrá permisos diferenciados. Cuando el broker se exponga a internet se utilizará TLS con validación del certificado del servidor. La gestión concreta de credenciales y su almacenamiento aún no están definidos; no se supone que las contraseñas deban guardarse en PostgreSQL.

## Decisiones recientes de datos y notificación

Las decisiones aprobadas sobre cuentas, unicidad de datos, vehículos, catálogo compartido, fotografías privadas, retención y eliminación se recogen en [decisiones para el diseño de datos](docs/decisiones-diseno-datos.md). Esta referencia no es un esquema implementado.

Ante cualquiera de los tres eventos, el nodo intentará SMS a todos los contactos de la última lista local recibida, aun sin MQTT. La lista cambia mediante sincronización y confirmación al reconectar; se informa al usuario si está pendiente. El backend intentará correos a los contactos vigentes al procesar el evento, incluso si llega tarde. Los destinatarios de ambos canales pueden diferir. Cada intento tendrá su resultado conocido, sin afirmar entrega no demostrada.

Eliminación de cuenta: la cuenta queda pendiente, se bloquean las acciones y el procesamiento asociados y se reintenta revocar las credenciales MQTT antes de completar el borrado y desvinculación. La política de respaldos y los fallos que no se resuelven con reintentos quedan pendientes o fuera del MVP.

## Reasignación de nodo a otro vehículo

Antes de confirmar una reasignación, el sistema deberá sincronizar los eventos pendientes del nodo y verificar sus confirmaciones de aplicación. Sin conexión o si no se puede verificar que la cola quedó sincronizada, no se completará el cambio. El procedimiento debe definir una barrera coordinada entre nodo y backend para que un evento generado durante el cambio no se atribuya al vehículo equivocado; un estado en línea o una cola observada vacía no bastan por sí solos. La asociación histórica deberá preservarse sin depender de que el reloj del nodo sea confiable.

El cambio físico no puede impedirse desde el software: el usuario deberá seguir el procedimiento acordado. El tratamiento de un nodo perdido, dañado o cambiado físicamente sin sincronizar sigue pendiente; no se presume una recuperación garantizada.

## Fallos y comportamiento por definir

| Situación | Impacto a considerar | Pendiente antes de implementación |
|---|---|---|
| Nodo o red sin conexión | El evento o la solicitud de ubicación puede no llegar a tiempo. | La cola persistente antes del envío está acordada; definir capacidad, caducidad de solicitudes, reintentos e información de estado. |
| Broker o backend no disponible | Se interrumpe el procesamiento del flujo correspondiente. | Definir recuperación, persistencia y observabilidad; una única instancia no aporta redundancia. |
| Ubicación no disponible o antigua | No se puede proporcionar una posición actual fiable. | Definir vigencia, espera y presentación; no mostrar una posición antigua como actual. |
| Mensaje duplicado o repetido | Podrían duplicarse registros o intentos de alerta. | Usar la combinación nodo + ID de evento para deduplicar; definir generación de IDs y evitar efectos secundarios duplicados. |
| Canal de notificación falla | El contacto puede no recibir el aviso. | Definir reintentos y estados verificables; no afirmar entrega sin evidencia. |

Los escenarios propuestos y sus limitaciones se mantienen en [escenarios de prueba](docs/escenarios-de-prueba.md). No hay resultados de ejecución ni objetivos numéricos de disponibilidad, capacidad o latencia acordados.

## Decisiones y compromisos iniciales

| Decisión | Beneficio buscado | Compromiso y revisión futura |
|---|---|---|
| Un backend monolítico | Empezar con un único servicio y límites internos claros. | Si la carga o la operación lo justifican, evaluar replicación o separación; no asumir que ya es necesaria. |
| Un broker Mosquitto | Mantener un único punto de comunicación MQTT para la primera versión. | Su indisponibilidad afecta el flujo; evaluar recuperación o clúster solo cuando se definan necesidades y capacidad. |
| PostgreSQL | Persistencia centralizada para el sistema inicial. | La operación, copias de seguridad, recuperación y cualquier replicación siguen por diseñar. |
| Despliegue propio como objetivo | Permitir que una persona o institución opere su instalación. | El mecanismo se decidirá después; revisar cómo encajan posibles servicios gestionados con ese objetivo. |

## Despliegue y límites

El proyecto no busca lucro y se concibe para que cada usuario o institución monte su propio prototipo y despliegue los servicios en infraestructura propia local o cloud. Esto no elimina posibles costos de hardware, conectividad o servicios externos; la licencia sigue pendiente. El broker debe ser accesible por los nodos cuando estén fuera de la red local, sin asumir cobertura permanente.

Un único broker, backend y base de datos simplifican el despliegue, pero cada uno puede interrumpir su función si falla. No se promete alta disponibilidad ni entrega infalible. La autenticación de personas, la implementación de credenciales individuales revocables, la autorización por nodo y la protección de coordenadas deben definirse y comprobarse; el transporte expuesto a internet utilizará TLS con validación del servidor. También se deben estudiar desconexiones, persistencia, mensajes duplicados, recuperación y notificaciones fallidas antes de considerar el sistema apto para emergencias.

## Pendiente de decisión

- Versiones, configuración del broker, bibliotecas de integración, conectividad del nodo y fuente de ubicación.
- Procedimientos de registro, verificación y recuperación de cuenta; vinculación y transferencia de propiedad; protocolo seguro de reasignación y tratamiento de excepciones. El uso compartido de nodos no está incluido inicialmente.
- Criterios de detección, armado/desarmado y tratamiento de falsas alarmas.
- Definir periodo de cancelación, proveedores, compatibilidad celular, reintentos, sincronización, resultado y política de avisos. SMS directo y correo del backend están previstos para los tres eventos.
- Factibilidad y procedimiento de integración con ECU 911; no simular una integración como operativa.
- Reglas de ubicación sin señal, tiempos de espera, historial y privacidad.
- Diseño detallado de los 10 escenarios de prueba y alcance de la simulación Wokwi.

## Organización del repositorio

| Ruta | Responsabilidad prevista |
|---|---|
| `apps/backend/` | Aplicación del servidor y lógica de negocio. |
| `apps/frontend/` | Interfaz de usuario. |
| `apps/broker/` | Configuración y recursos de despliegue del broker elegido; no implica desarrollar un broker propio. |
| `apps/node/` | Firmware, simulación y recursos del nodo físico según se definan. |
| `docs/` | Problemática, casos de uso y documentación de producto. |

El frontend contiene un proyecto inicial de Next.js; los demás componentes mantienen una estructura inicial sin implementar. Las tecnologías restantes, la configuración de Mosquitto y el mecanismo de despliegue siguen pendientes. El despliegue debe revisarse tras definir requisitos y arquitectura, incluidos posibles servicios cloud gestionados.
