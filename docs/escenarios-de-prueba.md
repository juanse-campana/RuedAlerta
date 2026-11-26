# Escenarios de prueba del prototipo

**Estado: propuestos, pendientes de definir parámetros y ejecutar.** Estos escenarios se derivan de los [casos de uso](casos-de-uso.md). No son resultados obtenidos. Su ejecución requiere precisar montaje, lecturas simuladas o físicas, umbrales, condiciones de autorización, canales y tiempos máximos aceptables.

## Preparación común

- Disponer de una instalación de prueba, usuarios y nodos identificados, con acceso al registro de eventos. Salvo indicación contraria, los componentes y la comunicación están operativos.
- Emplear señales simuladas o pruebas físicas controladas; no provocar accidentes ni poner personas en riesgo. Registrar cómo se generó cada señal y los parámetros usados.
- Para las notificaciones, usar destinatarios y canales de prueba controlados. **No enviar alertas de prueba al ECU 911.** La integración real requiere validar previamente su viabilidad y condiciones.
- Cuando se mencione una ubicación, emplear coordenadas de prueba y anotar su hora. La política de entrega inmediata o cancelación sigue pendiente: se aplica la decisión acordada antes de ejecutar.

## Los 10 escenarios

| ID y caso | Preparación y acción | Resultado esperado | Registro observado |
|---|---|---|---|
| **EP-01 — Movimiento no autorizado en bicicleta** (CU-05) | Activar las condiciones de vigilancia acordadas y simular el desplazamiento no autorizado de una bicicleta. | Se identifica y registra el movimiento y se gestiona el aviso al usuario asociado. | Pendiente |
| **EP-02 — Movimiento autorizado en motocicleta** (CU-05) | Establecer las condiciones de uso autorizado acordadas y simular un desplazamiento normal de la motocicleta. | No se genera alerta de movimiento no autorizado. | Pendiente |
| **EP-03 — Vibración inocua en bicicleta** (CU-05, CU-06) | En las condiciones de vigilancia acordadas, simular una vibración menor definida como no incidente. | No se clasifica como movimiento no autorizado, impacto ni caída; no se genera alerta por estos eventos. | Pendiente |
| **EP-04 — Impacto en motocicleta** (CU-06, CU-07) | Simular un impacto definido como incidente; configurar un contacto y coordenadas de prueba disponibles. | Se registra el impacto y se intenta enviar una alerta con tipo de evento y ubicación al contacto configurado. | Pendiente |
| **EP-05 — Caída de bicicleta** (CU-06, CU-07) | Simular una caída definida como incidente; configurar dos contactos y coordenadas de prueba disponibles. | Se registra la caída y se intenta alertar a ambos contactos configurados con tipo de evento y ubicación. | Pendiente |
| **EP-06 — Solicitud de ubicación disponible** (CU-04) | El usuario autorizado solicita la ubicación de su nodo conectado, que dispone de coordenadas de prueba. | Se muestran las coordenadas recibidas y su momento de obtención cuando esté disponible. | Pendiente |
| **EP-07 — Ubicación no disponible** (CU-04) | El usuario autorizado solicita ubicación cuando el nodo no puede proporcionar una posición actual. | Se informa la indisponibilidad; no se presenta una posición antigua como actual. | Pendiente |
| **EP-08 — Separación entre usuarios** (CU-02, CU-04) | Crear usuarios A y B con nodos distintos; A intenta solicitar ubicación del nodo de B sin autorización. | El acceso se deniega y A no recibe las coordenadas de B. | Pendiente |
| **EP-09 — Caída sin coordenadas** (CU-06, CU-07) | Simular una caída con contacto de prueba configurado y sin ubicación disponible. | Se registra la caída y se intenta alertar al contacto indicando que no hay ubicación disponible, sin inventar coordenadas. | Pendiente |
| **EP-10 — Fallo del canal de aviso** (CU-06, CU-07) | Simular un impacto con un contacto configurado y provocar un fallo controlado en el canal de prueba. | Se registra el evento y el resultado fallido conocido del intento; no se afirma que la alerta fue entregada. | Pendiente |

## Correspondencia con requisitos

La tabla relaciona cada escenario con los requisitos que pretende comprobar **total o parcialmente**, no con resultados aprobados. Los requisitos completos y sus criterios pendientes se mantienen en la [ERS IEEE](requisitos-ieee830.md).

| Escenario | Requisitos relacionados | Cobertura prevista |
|---|---|---|
| EP-01 | RF-07 | Detección y aviso por movimiento no autorizado. |
| EP-02 | RF-07 | Ausencia de alerta para movimiento autorizado. |
| EP-03 | RF-15 | Ausencia de alerta ante vibración definida como inocua. |
| EP-04 | RF-08, RF-10 | Impacto y gestión de aviso a un contacto. |
| EP-05 | RF-09, RF-10 | Caída y gestión de aviso a dos contactos. |
| EP-06 | RF-05 | Solicitud autorizada de ubicación disponible. |
| EP-07 | RF-06 | Indicación de ubicación actual no disponible. |
| EP-08 | RF-03 | Denegación de acceso a ubicación de otro usuario. |
| EP-09 | RF-09, RF-10, RF-11 | Caída y aviso sin ubicación disponible. |
| EP-10 | RF-08, RF-12 | Impacto y registro del fallo del canal. |

**Brechas adicionales tras las decisiones recientes:** faltan pruebas de SMS directo sin MQTT, falta de cobertura, sincronización y eliminación de contactos, correo con contactos vigentes y eventos tardíos, fotos privadas, límites y borrado, retención y eliminación de eventos y revocación MQTT al eliminar la cuenta. No se han añadido resultados ni alterado los diez escenarios originales.

**Brechas conocidas:** los diez escenarios no incluyen pruebas dedicadas de autenticación (RF-01), vinculación de varios nodos (RF-02), configuración de contactos (RF-04), consulta de historial (RF-13) ni despliegue (RF-14). Tampoco demuestran por sí solos rendimiento, seguridad completa, confiabilidad o entrega real. Se podrán planificar pruebas adicionales sin presentar estos diez escenarios como cobertura completa.

## Registro de ejecución

Para cada ejecución anotar: fecha y versión, escenario y vehículo/nodo, configuración y parámetros, señales de entrada, coordenadas y su hora si corresponden, destinatarios previstos, respuesta observada y evidencias. Anotar además tiempo hasta detección y notificación cuando puedan medirse, así como la disponibilidad de conectividad.

Clasificar cada **resultado del escenario** como aprobado, fallido o bloqueado y justificarlo. Para las pruebas de detección registrar por separado si hubo **acierto**, **omisión** (evento esperado sin detectar), **falsa alarma** (alerta cuando no se esperaba) o **clasificación incorrecta**. Una prueba funcional sin evento no se cuenta automáticamente como acierto de detección. Registrar entrega solo cuando exista evidencia del destinatario o del canal.

Los 10 escenarios son una comprobación inicial y no prueban funcionamiento universal ni tasas fiables de desempeño. No incluyen una prueba real del ECU 911. El enunciado original pide elegir un vehículo y un evento principal; confirmar con la evaluación si este conjunto ampliado satisface ese requisito.
