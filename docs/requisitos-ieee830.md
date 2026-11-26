# Especificación de requisitos de RuedAlerta

**Estado:** borrador inicial para revisión; no es una especificación cerrada ni una certificación de conformidad. Organizado según el formato IEEE 830-1998 descrito en el material facilitado. Los criterios marcados **pendientes** requieren decisión antes de poder verificar el requisito por completo. No hay resultados de pruebas.

## 1. Introducción

### 1.1 Propósito

Documentar los requisitos iniciales del sistema para orientar a las personas responsables del diseño, desarrollo y validación. Sus identificadores permiten relacionarlos con los casos de uso y las pruebas propuestas.

### 1.2 Ámbito del sistema

RuedAlerta busca permitir la detección y comunicación de movimiento no autorizado, impacto y caída en bicicletas y motocicletas; la consulta de coordenadas; y las alertas a contactos configurados. El aviso al ECU 911 es un objetivo condicionado a verificar la viabilidad de integración. El proyecto no busca lucro y se concibe para despliegue autogestionado. No pretende inmovilizar vehículos, prestar asistencia médica ni garantizar una respuesta de emergencia. El alcance detallado está en [problemática y alcance](problem-statement.md).

El enunciado original propone elegir un vehículo y un evento principal; la ampliación a ambos tipos de vehículo y tres eventos debe confirmarse con quien evalúa el proyecto.

### 1.3 Definiciones, acrónimos y abreviaturas

- **Nodo:** prototipo instalado en una bicicleta o motocicleta que obtiene datos y se comunica con la plataforma.
- **Evento:** señal de movimiento no autorizado, impacto o caída detectada según criterios aún por definir.
- **MQTT:** protocolo de mensajería basado en publicación y suscripción.
- **Broker:** intermediario que distribuye mensajes MQTT.
- **Contacto:** destinatario de emergencia configurado por el usuario.
- **ERS:** especificación de requisitos de software.
- **ECU 911:** servicio de atención de emergencias considerado como posible destinatario, sujeto a viabilidad.

### 1.4 Referencias

- [Problemática y alcance](problem-statement.md).
- [Decisiones para el diseño de datos](decisiones-diseno-datos.md).
- [Diseño de base de datos](diseno-base-datos.md).
- [Diagrama entidad-relación](diagrama-entidad-relacion.md).
- [Casos de uso](casos-de-uso.md).
- [Escenarios de prueba](escenarios-de-prueba.md).
- [Arquitectura inicial](../ARCHITECTURE.md).
- [Seguridad](../SECURITY.md).
- Material facilitado por el usuario: *Especificación de Requisitos según el estándar de IEEE 830*, IEEE Std. 830-1998, 22 de octubre de 2008.

### 1.5 Visión general del documento

La sección 2 presenta el contexto; la sección 3 enumera requisitos e interfaces; la sección 4 recoge decisiones pendientes y trazabilidad.

## 2. Descripción general

### 2.1 Perspectiva del producto

El sistema comprende nodos físicos, un broker MQTT Eclipse Mosquitto, un backend monolítico NestJS con TypeScript, un frontend Next.js y una base de datos PostgreSQL en la arquitectura inicial. El frontend cuenta con un proyecto inicial; los demás componentes aún no están implementados. Puede depender de servicios externos de notificación y ubicación. El mecanismo de despliegue y los proveedores aún no se han elegido.

### 2.2 Funciones del producto

Gestionar usuarios, nodos y contactos; procesar eventos; solicitar ubicación; mostrar historial; y gestionar avisos. El detalle está en la sección 3.

### 2.3 Características de los usuarios

Ciclistas y motociclistas utilizarán la interfaz; una persona administradora desplegará y operará una instalación; los contactos recibirán avisos. Sus conocimientos y necesidades de accesibilidad concretos aún no se han determinado.

### 2.4 Restricciones

El nodo utilizará MQTT para comunicarse con el sistema. La primera arquitectura contempla una instancia de cada componente de servidor. Se mantendrá el carácter no lucrativo y se busca permitir despliegue propio local o cloud. La licencia y el mecanismo de despliegue no están decididos.

### 2.5 Suposiciones y dependencias

La comunicación depende de la conectividad y disponibilidad de los componentes; la ubicación depende de una fuente de posicionamiento aún no seleccionada. Los avisos se prevén por correo desde el backend y SMS desde el nodo; sus proveedores e implementación no están definidos. No se presupone acceso a una interfaz del ECU 911 ni cobertura continua.

### 2.6 Requisitos futuros

Replicación del backend, clúster del broker, balanceo y alta disponibilidad son posibilidades para una etapa posterior, no compromisos de la versión inicial. La integración real con ECU 911 se evaluará tras verificar su factibilidad.

## 3. Requisitos específicos

**Convención:** todos los requisitos son de borrador. Su prioridad y criterios faltantes deben confirmarse. Los IDs de casos de uso (CU) y escenarios (EP) remiten a los documentos referenciados; una prueba propuesta no implica que se haya ejecutado.

### 3.1 Interfaces externas

- **IE-01 — Interfaz de usuario:** el frontend deberá permitir acceder a las funciones autorizadas de nodos, ubicación, contactos e historial. Diseño y accesibilidad: pendientes. Referencias: CU-01 a CU-04, CU-08.
- **IE-02 — Comunicación de nodo:** el nodo y el sistema deberán intercambiar eventos y solicitudes mediante MQTT. Credenciales individuales revocables y permisos mínimos por nodo; versión, estructura de mensajes, mecanismo de autenticación y temas: pendientes. Referencias: CU-04 a CU-06.
- **IE-03 — Notificaciones:** el backend deberá intentar correos y el nodo deberá intentar SMS para los tres eventos a los contactos aplicables. El SMS requiere hardware y cobertura celular, aunque no MQTT. Proveedores, formatos, estados y confirmación de entrega: pendientes. Referencia: CU-07.
- **IE-04 — ECU 911 (condicional):** evaluar la existencia y condiciones de un canal de integración; no se requiere ni presume conexión operativa hasta confirmar viabilidad y acordar alcance. Referencia: CU-07.

### 3.2 Funciones

| ID | Requisito propuesto | Verificación propuesta / trazabilidad | Estado |
|---|---|---|---|
| RF-01 | El sistema deberá permitir registro e inicio de sesión con correo y contraseña, verificación de correo y recuperación por correo; usará JWT de acceso y token de renovación con registro por sesión en PostgreSQL. | Probar registro, verificación, acceso, renovación y recuperación; CU-01. | Proveedor, duración y mecanismos de revocación pendientes |
| RF-02 | El sistema deberá permitir asociar varios nodos a un usuario. | Vincular al menos dos nodos y consultar su asociación; CU-02. | Procedimiento pendiente |
| RF-03 | El sistema deberá admitir múltiples usuarios y limitar el acceso a cada nodo a su propietario; inicialmente no se permitirá compartir nodos. | Intentar acceso cruzado al nodo de otro usuario; CU-02, EP-08. | Transferencia de propiedad pendiente |
| RF-04 | El usuario deberá poder mantener contactos propios y seleccionar los de cada nodo; un contacto podrá asignarse a varios nodos. Se permitirá no asignar contactos y se advertirá que no se enviarán avisos a contactos. | Asignar contactos distintos a dos nodos, reutilizar uno y verificar advertencia sin contactos; CU-03. | Validación y consentimiento pendientes |
| RF-05 | El usuario autorizado deberá poder solicitar las coordenadas de un nodo asociado. | Solicitud con respuesta disponible; CU-04, EP-06. | Tiempo máximo pendiente |
| RF-06 | Si no hay una ubicación actual disponible, el sistema deberá comunicar esa condición y no presentar una posición antigua como actual. | Simular falta de ubicación; CU-04, EP-07. | Vigencia de posición pendiente |
| RF-07 | El sistema deberá detectar y registrar movimiento no autorizado según criterios acordados y gestionar el aviso al usuario. | Movimiento no autorizado y movimiento normal; CU-05, EP-01 y EP-02. | Criterios y umbrales pendientes |
| RF-08 | El sistema deberá detectar y registrar un impacto según criterios acordados. | Simular impacto y revisar registro; CU-06, EP-04. | Criterios y umbrales pendientes |
| RF-09 | El sistema deberá detectar y registrar una caída según criterios acordados. | Simular caída y revisar registro; CU-06, EP-05. | Criterios y umbrales pendientes |
| RF-10 | Ante movimiento no autorizado, impacto o caída, el nodo deberá intentar SMS a sus contactos locales y el backend correos a los contactos vigentes al procesar el evento; incluir tipo y ubicación disponible según contrato pendiente. | Probar cada evento y destinatarios; CU-07, EP-04 y EP-05. | Módem, proveedor, contenido y política de cancelación pendientes |
| RF-11 | Si no hay coordenadas disponibles para una alerta, el sistema deberá indicar esa condición sin inventar una ubicación. | Simular caída sin ubicación; CU-07, EP-09. | Tratamiento de posición antigua pendiente |
| RF-12 | El sistema deberá registrar el resultado conocido del intento de notificación y no indicar entrega sin evidencia. | Provocar fallo de canal; CU-07, EP-10. | Estados y reintentos pendientes |
| RF-13 | El usuario autorizado deberá poder consultar los eventos registrados de sus nodos. | Registrar evento y consultar historial; CU-08. | Filtros pendientes; eventos sin TTL |
| RF-14 | El sistema deberá permitir desplegar y operar una instalación propia. | Validar procedimiento documentado en el entorno elegido; CU-09. | Mecanismo y compatibilidad con servicios gestionados pendientes |
| RF-15 | El sistema no deberá generar alertas de movimiento no autorizado, impacto ni caída ante una vibración definida como no incidente. | Señal de vibración inocua; CU-05, CU-06, EP-03. | Señal y umbrales pendientes |
| RF-16 | Cada nodo deberá tener una identidad única y un único propietario a la vez; un usuario podrá poseer varios nodos. | Vincular dos nodos al mismo usuario e impedir dos propietarios simultáneos. | Transferencia y registro pendientes |
| RF-17 | El sistema deberá distinguir nodo y vehículo, preservar el vehículo asociado a cada evento al ocurrir y exigir que los eventos pendientes estén sincronizados y confirmados antes de completar una reasignación. | Bloquear la reasignación sin sincronización; tras sincronizar, reasignar y comprobar que los eventos anteriores mantienen su vehículo. | Barrera de transición, excepciones y registro histórico pendientes |
| RF-18 | El nodo deberá generar un UUID estable para cada evento, guardarlo en almacenamiento persistente local antes de enviarlo y conservarlo hasta una confirmación de aplicación válida. | Desconectar, registrar y reconectar; verificar que la confirmación MQTT por sí sola no libera el evento. | Capacidad y recuperación pendientes; requisitos RN-02 a RN-06 del nodo |
| RF-19 | El backend deberá evitar registros duplicados usando la identidad del nodo y el ID estable del evento, y confirmar de nuevo una repetición ya guardada. | Reenviar un evento tras perder su confirmación; observar un solo registro y una nueva confirmación. | Generación de IDs y efectos secundarios pendientes |
| RF-20 | El sistema deberá mantener el estado actual conocido del nodo y la última comunicación observada, sin requerir historial inicial de conexiones. | Observar la actualización del estado y la última comunicación durante una prueba controlada. | Mecanismo y tiempos pendientes |
| RF-21 | El sistema deberá registrar solicitudes de ubicación independientes con identificador y estado, relacionar sus respuestas y conservarlas hasta que el usuario decida eliminarlas. | Solicitar ubicación y verificar respuesta y eliminación autorizada; CU-04, CU-11, EP-06. | Caducidad de solicitudes en curso y desconexión pendientes |
| RF-22 | El sistema deberá registrar para cada evento su tipo, nodo, ID de evento, hora de recepción y, cuando sean conocidas, hora confiable de ocurrencia y ubicación con su momento de obtención. | Registrar eventos con y sin hora o ubicación y comprobar que no se inventan valores. | Esquema y formato pendientes |

### 3.2.1 Decisiones adicionales para datos y notificaciones

Los detalles verificables y límites se mantienen en [decisiones para el diseño de datos](decisiones-diseno-datos.md). Resumen de requisitos acordados:

| ID | Requisito | Verificación propuesta / pendiente |
|---|---|---|
| RF-23 | Registro con nombres, apellidos, correo y teléfono obligatorios y cédula opcional de 10 dígitos; correo, teléfono y cédula presente únicos por instalación. Comparar correo sin mayúsculas ni espacios en extremos y teléfono con `+`, país y dígitos; sin verificación SMS obligatoria en MVP. | Comprobar obligatorios, duplicados, formatos y varias cédulas ausentes; validación de dígito verificador pendiente. |
| RF-24 | Cada vehículo activo tendrá como máximo un nodo activo; placa opcional única entre vehículos activos comparada sin mayúsculas, espacios ni guiones y reutilizable tras retiro. | Intentar asociaciones y placas duplicadas, retirar y volver a registrar sin compartir historial; reglas de jurisdicción pendientes. |
| RF-25 | Permitir catálogo compartido de marcas y modelos, con modelo asociado a marca, ambos opcionales para el vehículo; no permitir modificar o eliminar entradas usadas por otros usuarios. | Crear y seleccionar entradas; verificar bloqueo y acceso entre usuarios; duplicados pendientes. |
| RF-26 | Permitir hasta diez fotos privadas JPEG o PNG de hasta 10 MB por vehículo; permitir elegir principal y elegir la más antigua restante si se elimina. | Probar límites, acceso cruzado y eliminación; desempate, validación y almacenamiento pendientes. |
| RF-27 | Mantener eventos sin TTL hasta eliminación del usuario, borrar sus intentos asociados y conservar marca mínima mientras pueda aceptarse un reenvío; retirarla solo con evidencia confiable de que ya no puede aceptarse. | Borrar un evento y reenviarlo; comprobar ausencia de datos e intentos y ausencia de recreación; CU-11. |
| RF-28 | Al eliminar un contacto, conservar intentos anteriores sin sus datos personales. | Eliminar contacto y revisar intentos, referencias y mensajes de error. |
| RF-29 | Mantener lista local de contactos por nodo, sincronizar y confirmar cambios, mostrar sincronización pendiente o completa y usar última lista recibida sin MQTT. | Cambiar contactos desconectado, observar lista anterior y confirmar actualización tras reconectar. |
| RF-30 | Tras confirmar eliminación de cuenta, bloquear procesamiento y reintentar revocación MQTT antes de completar la eliminación y desvincular; emitir credenciales nuevas ante nuevo registro. | Simular broker inaccesible y reconexión; comprobar estado pendiente, reintentos y ausencia de procesamiento. Respaldos y fallos permanentes pendientes o fuera del MVP. |
| RF-31 | Registrar resultados conocidos de intentos individuales de correo y SMS por evento y destinatario y sincronizar resultados locales de SMS. | Probar varios contactos y canales, reenvío y fallos sin afirmar entrega no confirmada. |
| RF-32 | Exigir nombres, apellidos, correo y teléfono para cada contacto, con cédula opcional de 10 dígitos; impedir correo, teléfono y cédula presente duplicados dentro de la lista del usuario. | Registrar datos incompletos y duplicados del mismo propietario y comprobar que distintas cuentas puedan reutilizar un contacto; CU-03. |
| RF-33 | Conservar solicitudes y respuestas de ubicación hasta que el usuario autorizado decida eliminarlas; no introducir TTL automático por defecto. | Registrar, consultar y eliminar una solicitud propia; impedir acceso cruzado; CU-04, CU-11. |
| RF-34 | Permitir cerrar y revocar la renovación mediante el registro por sesión; los JWT de acceso ya emitidos se tratarán según el mecanismo que se defina. | Revocar sesión, rechazar su renovación y evaluar uso del JWT emitido; CU-01, CU-12. |
| RF-35 | Utilizar UUID internos para usuario, vehículo, nodo, contacto y solicitud; generar un UUID de evento en el nodo y conservarlo en reintentos. | Crear registros y reenviar evento observando IDs estables; CU-05, CU-06. |

### 3.3 Requisitos de rendimiento

- **RNF-01 — Detección:** deberá medirse el tiempo desde la señal de prueba hasta la detección. Límite de aceptación y método de medición: **pendientes**.
- **RNF-02 — Notificación:** deberá medirse el tiempo desde el evento hasta el resultado observable del intento de aviso. Límite y punto de medición: **pendientes**.
- **RNF-03 — Capacidad:** número de usuarios y nodos concurrentes y carga de mensajes: **pendientes**; no se fija una cifra sin acuerdo y pruebas.

### 3.4 Restricciones de diseño

- **RD-01:** la comunicación nodo-sistema deberá utilizar MQTT; detalles pendientes.
- **RD-02:** la arquitectura inicial utilizará un broker MQTT Eclipse Mosquitto, un backend NestJS con TypeScript, un frontend Next.js y una base de datos PostgreSQL. No se establece un mecanismo específico de despliegue.
- **RD-03:** el proyecto no tendrá como objetivo generar lucro; esto no implica ausencia de costos de infraestructura o servicios.

### 3.5 Atributos del sistema

- **RNF-04 — Seguridad:** cada nodo deberá contar con credenciales propias revocables y permisos mínimos por tema, separados de los del backend; cuando el broker esté expuesto a internet se utilizará TLS con validación del certificado del servidor. El acceso de personas usará correo y contraseña, con verificación previa y recuperación por correo; los mecanismos concretos y criterios de verificación siguen pendientes; véase [seguridad](../SECURITY.md).
- **RNF-05 — Privacidad:** definir y verificar acceso, retención y eliminación de coordenadas y contactos. Periodos y políticas: pendientes.
- **RNF-06 — Confiabilidad:** mantener los eventos pendientes hasta confirmación del backend posterior a la persistencia, recuperarlos y procesar los duplicados idempotentemente. La gestión de fallos, capacidad y avisos sigue pendiente; no se garantiza entrega permanente.
- **RNF-07 — Usabilidad:** definir perfiles y criterios observables de accesibilidad y uso; pendientes.

### 3.6 Otros requisitos

- **RO-01 — Validación:** preparar y ejecutar 10 escenarios acordados, registrar el resultado observado, evidencias y clasificación de aciertos, omisiones y falsas alarmas cuando corresponda. Véase [escenarios de prueba](escenarios-de-prueba.md); todos están pendientes.
- **RO-02 — Pruebas seguras:** las pruebas de aviso deberán usar destinatarios controlados y no generar alertas de prueba al ECU 911.
- **RO-03 — Documentación:** proporcionar instrucciones para instalar y operar la solución y preparar el nodo cuando se definan las tecnologías restantes y el despliegue.

## 4. Apéndices

### A. Decisiones pendientes para cerrar la ERS

1. Confirmar con quien evalúa el proyecto el vehículo y evento principal, y si se acepta el alcance ampliado.
2. Definir cómo se autoriza un movimiento, los umbrales y señales de impacto y caída, y la generación segura y el ámbito del UUID de evento en el nodo.
3. Acordar tiempos, capacidad, criterios de aceptación y detalles de recuperación y de efectos secundarios ante duplicados.
4. Definir implementación de registro y correo, vinculación y transferencia de nodos, protocolo de reasignación sin pérdida de contexto, fuente y vigencia de ubicación, mecanismos de seguridad y retención.
5. Definir proveedores e implementación de correo y SMS, contenido, fallos, reintentos y si existe tiempo de cancelación de alertas.
6. Verificar factibilidad y condiciones de ECU 911; no asumir integración real.
7. Decidir versiones, configuración del broker, tecnologías restantes y mecanismo de despliegue después de revisar requisitos y arquitectura.

### B. Estado de trazabilidad

La siguiente matriz vincula los casos de uso con requisitos y escenarios **propuestos**, no con resultados de pruebas. «Sin escenario dedicado» señala una brecha en los 10 escenarios actuales, no una exclusión del alcance.

| Caso de uso | Requisitos relacionados | Escenarios propuestos | Brecha principal |
|---|---|---|---|
| CU-01 — Acceso | RF-01 | Sin escenario dedicado | Falta probar credenciales válidas e inválidas. |
| CU-02 — Vincular y consultar nodos | RF-02, RF-03 | EP-08 (aislamiento parcial) | Falta probar vinculación y varios nodos por usuario. |
| CU-03 — Contactos | RF-04 | EP-04, EP-05 (uso posterior) | Falta probar alta, modificación y validación de contactos. |
| CU-04 — Ubicación | RF-03, RF-05, RF-06 | EP-06, EP-07, EP-08 | Falta definir vigencia y tiempo de espera. |
| CU-05 — Movimiento no autorizado | RF-07, RF-15 | EP-01, EP-02, EP-03 | Faltan criterios de autorización y umbrales. |
| CU-06 — Impacto o caída | RF-08, RF-09, RF-15 | EP-03, EP-04, EP-05, EP-09, EP-10 | Faltan señales y umbrales verificables. |
| CU-07 — Alertas | RF-10, RF-11, RF-12; IE-04 condicional | EP-04, EP-05, EP-09, EP-10 | Faltan implementación de SMS y correo, cancelación y definición de entrega; ECU 911 sin prueba real. |
| CU-08 — Historial | RF-13 | Sin escenario dedicado | Falta comprobar consulta autorizada y ausencia de eventos. |
| CU-09 — Despliegue | RF-14 | Sin escenario dedicado | Mecanismo y criterios operativos pendientes de decisión. |
| CU-10 — Vehículos | RF-17, RF-24, RF-25, RF-26 | Sin escenario dedicado | Faltan pruebas de reasignación, catálogo y fotos. |
| CU-11 — Eliminación de registros | RF-21, RF-27, RF-33 | Sin escenario dedicado | Faltan pruebas de borrado autorizado, reenvío y respuestas tardías. |
| CU-12 — Eliminar cuenta | RF-30, RF-34 | Sin escenario dedicado | Faltan pruebas de revocación MQTT, bloqueo y sesión. |

Los criterios aún pendientes impiden considerar todos los requisitos completamente verificables. La relación con componentes implementados y evidencias se añadirá después del desarrollo y la ejecución; no se debe inferir que los escenarios hayan sido aprobados.

### C. Criterios de aceptación propuestos para los flujos prioritarios

Estos criterios son comprobaciones iniciales sujetas a los parámetros y decisiones pendientes; no sustituyen los escenarios completos.

- **RF-03 / EP-08:** dado que A no está autorizado para el nodo de B, cuando A solicite su ubicación, el sistema deberá denegar el acceso y no revelar las coordenadas.
- **RF-05 y RF-06 / EP-06 y EP-07:** dada una solicitud autorizada, cuando el nodo proporcione ubicación disponible, el sistema deberá mostrarla; si no puede obtener una posición actual, deberá comunicar la indisponibilidad sin presentar una posición antigua como actual. Vigencia y tiempo de espera: pendientes.
- **RF-07 / EP-01 y EP-02:** dados los criterios de autorización y detección acordados, el movimiento definido como no autorizado deberá registrarse y generar la gestión del aviso; el movimiento definido como autorizado no deberá generar una alerta de movimiento no autorizado.
- **RF-08 a RF-12 / EP-04, EP-05, EP-09 y EP-10:** con señales de prueba acordadas, el sistema deberá registrar el impacto o caída y gestionar los avisos conforme a la configuración; si falta ubicación deberá indicarlo y, si falla el canal, no deberá afirmar que el aviso fue entregado.

Los criterios para el despliegue propio, el comportamiento sin conexión, los tiempos y la política de cancelación requieren decisiones adicionales. La integración directa con ECU 911 sigue condicionada a validar su viabilidad.
