# Requisitos del nodo: eventos y funcionamiento sin conexión

**Estado:** borrador para diseño; ninguna función descrita aquí está implementada o validada. Este documento precisa los requisitos del nodo y las responsabilidades que deberá acordar con el backend. Se relaciona con la [ERS global](../../../docs/requisitos-ieee830.md), la [arquitectura global](../../../ARCHITECTURE.md) y los [materiales propuestos](materiales.md).

## Objetivo y alcance

El nodo basado en ESP32 deberá detectar los eventos acordados, conservarlos mientras no haya confirmación de almacenamiento y recuperarlos tras reconectarse. Utilizará Wi‑Fi para acceder a MQTT; además, se prevé un módem celular externo para SMS independiente de MQTT, todavía sin seleccionar ni validar. Se guardarán **eventos**, no todas las lecturas crudas de sensores en PostgreSQL. Las señales necesarias para detectar un evento y sus umbrales todavía deben definirse.

Los eventos contemplados son movimiento no autorizado, impacto y caída. La ubicación se adjuntará cuando esté disponible y corresponda al evento; el tratamiento de una ubicación antigua está pendiente. Las solicitudes de ubicación serán independientes y tendrán un identificador para correlacionar su respuesta; el backend registrará solicitud, estado y respuesta. La caducidad y el comportamiento sin conexión siguen pendientes.

## Flujo acordado

1. El nodo detecta un evento según criterios todavía por definir y le asigna un identificador estable.
2. El nodo guarda el evento en una cola local persistente en flash **antes de intentar enviarlo**, esté o no conectado.
3. Cuando exista conectividad, el nodo intenta publicar los eventos pendientes mediante MQTT.
4. El backend procesa el evento y, tras confirmar su almacenamiento en PostgreSQL, publica una confirmación de aplicación vinculada al evento y al nodo.
5. El nodo valida la confirmación correspondiente y solo entonces marca el evento como entregado y libera su espacio según la implementación elegida.
6. Si falta la confirmación o ocurre una desconexión, el evento permanece pendiente y podrá reenviarse con el mismo identificador.

La confirmación MQTT del broker **no sustituye** la confirmación del backend de que se guardó en la base de datos. Si se pierde la confirmación del backend, el reenvío puede repetir el mensaje: el backend deberá procesarlo de forma idempotente y poder confirmar nuevamente un evento ya almacenado sin crear otro registro.

## Requisitos funcionales del nodo

| ID | Requisito | Criterio de aceptación propuesto |
|---|---|---|
| RN-01 | El nodo procesará las señales de los sensores para identificar movimiento no autorizado, impacto y caída conforme a criterios acordados. | Con señales y criterios de prueba definidos, genera el tipo de evento esperado; los umbrales están pendientes. |
| RN-02 | El nodo asignará un identificador estable a cada evento y conservará ese identificador en sus reintentos. | Al reenviar un evento, el identificador permanece igual; la estrategia de unicidad está por definir. |
| RN-03 | El nodo guardará cada evento detectado en almacenamiento persistente local antes de intentar publicarlo. | Al comprobar el orden en una prueba controlada, el evento consta como pendiente antes del intento de publicación. |
| RN-04 | El nodo conservará los eventos pendientes guardados correctamente durante una desconexión y un reinicio. | Guardar un evento, reiniciar y comprobar que sigue pendiente. Esto no garantiza el evento que se estuviera escribiendo durante un corte eléctrico. |
| RN-05 | El nodo intentará enviar los eventos pendientes cuando recupere conectividad. | Generar un evento sin conexión, reconectar y observar un intento con el mismo identificador. |
| RN-06 | El nodo no liberará el evento hasta recibir una confirmación de aplicación válida para ese evento y nodo. | Sin confirmación, el evento sigue pendiente; con confirmación válida posterior al almacenamiento, se marca como entregado y se libera según el diseño. |
| RN-07 | El nodo mantendrá información de estado de conectividad para permitir informar si está en línea o desconectado. | El sistema refleja cambios según el mecanismo y tiempos de health check que se definan. El estado no demuestra que el evento esté guardado en PostgreSQL. |
| RN-08 | El nodo incluirá la información temporal disponible del evento e indicará si la hora no está disponible o no es confiable. | En pruebas con y sin hora confiable, no se presenta una marca desconocida como hora confirmada. El formato y el mecanismo de reloj están pendientes. |

## Responsabilidades del backend y del broker

- El broker transporta mensajes; no se considera que su confirmación pruebe la escritura en PostgreSQL.
- El backend deberá confirmar un evento únicamente después de que el almacenamiento en PostgreSQL se haya confirmado. La confirmación debe identificar el evento y nodo; su formato, autenticación y autorización están pendientes.
- El backend deberá reconocer duplicados mediante la combinación de identidad del nodo e ID estable del evento y evitar registros duplicados. Una repetición de un evento ya persistido debe poder producir de nuevo la confirmación de aplicación, sin repetir efectos no deseados; el correo de eventos tardíos se intentará; detalles de reintentos y protección contra duplicados siguen pendientes.
- Wi‑Fi o MQTT disponibles no aseguran que el backend, la base de datos o el canal de notificaciones estén funcionando.

## Información mínima prevista para un evento

- Identificador del evento e identificador del nodo.
- Tipo de evento detectado.
- Momento de recepción, registrado por el backend.
- Momento de ocurrencia y estado de confiabilidad de la hora, cuando estén disponibles.
- Ubicación y momento de obtención, cuando estén disponibles y se decida adjuntarlos; no inventar coordenadas ni presentar una posición antigua como actual.

El formato MQTT, el mecanismo concreto de identidad segura y los campos adicionales se definirán más adelante. Cada nodo tendrá credenciales propias revocables y permisos mínimos por tema; las conexiones expuestas a internet utilizarán TLS con validación del certificado del servidor. La confirmación de almacenamiento no significa que un contacto haya recibido una alerta.

## SMS y contactos sin MQTT

Ante movimiento no autorizado, impacto o caída, el nodo intentará enviar SMS a todos los contactos de la última lista recibida, aunque no tenga MQTT. El módem, SIM, servicio, cobertura, energía y compatibilidad con las redes deben validarse; no se garantiza envío ni recepción. Sin contactos no hay destinatarios. Ante ausencia temporal de cobertura se conservarán y reintentará el envío pendiente; límites y tratamiento de resultados inciertos y duplicados están pendientes.

Los cambios de contactos se enviarán al nodo, se confirmará su aplicación y se informará si la sincronización está pendiente. Desconectado usará la última lista recibida; un contacto eliminado podría recibir SMS hasta que se actualice. La lista debe protegerse, persistirse y recuperarse; sus versiones, capacidad y protocolo aún no se han diseñado. El nodo comunicará al backend el resultado conocido de los intentos cuando recupere conectividad, sin afirmar recepción sin evidencia.

## Reasignación a otro vehículo

Cada evento deberá conservar el vehículo asociado cuando ocurrió. Antes de completar una reasignación, los eventos pendientes del nodo deben sincronizarse y recibir confirmación de aplicación. Sin conexión o sin confirmación de que la cola se sincronizó, el sistema no completará la reasignación. Se necesita diseñar una barrera coordinada nodo-backend para los eventos generados durante el cambio; el mecanismo, el cambio físico y las excepciones por pérdida o daño del nodo siguen pendientes.

## Pruebas propuestas pendientes

- Evento con conexión: guardar localmente, enviar, confirmar persistencia y liberar la entrada.
- Evento sin conexión: conservarlo localmente y reenviarlo tras reconectar.
- Reinicio con eventos pendientes: recuperar la cola y reintentar cuando sea posible.
- Confirmación perdida: reenviar el mismo ID; el backend mantiene un único evento y puede volver a confirmar.
- Confirmación inválida o de otro evento: no liberar el evento pendiente.
- Broker accesible con backend o PostgreSQL no disponible: no interpretar el acuse MQTT como confirmación de almacenamiento.
- Falta de ubicación o de hora confiable: registrar la condición sin inventar datos.
- Reasignación: bloquear sin sincronización, verificar eventos durante la transición y conservar la asociación histórica tras completar el cambio.
- Cola llena y corte durante escritura: verificar la política y la recuperación **después de que se definan**.

Estas pruebas no se han ejecutado y no reemplazan los [escenarios globales](../../../docs/escenarios-de-prueba.md).

## Decisiones pendientes y límites

- Elegir mecanismo de almacenamiento, partición, capacidad, desgaste admisible y comportamiento cuando la cola esté llena o se detecten datos corruptos.
- Definir reintentos, orden de envío, QoS, formato de mensajes, tiempos, generación de identidades y protección de confirmaciones.
- Definir la fuente y sincronización de hora, y qué hacer si la posición es antigua o no existe.
- Acordar detección de eventos, manejo de falsas alarmas, módem, SMS, sincronización y límites de reintentos; la integración ECU 911 continúa sujeta a viabilidad.
- Definir cómo medir disponibilidad y diferenciar conectividad Wi‑Fi, sesión MQTT y funcionamiento del backend; los umbrales de health check no están acordados.

La cola persistente reduce el riesgo de pérdida, pero no garantiza captura o entrega en todos los casos: un corte durante la escritura, daño del dispositivo, agotamiento de almacenamiento o ausencia prolongada de red pueden impedirlo. No garantiza una alerta inmediata ni sustituye un servicio de emergencia.
