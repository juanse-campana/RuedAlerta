# Casos de uso de RuedAlerta

**Estado:** borrador actualizado con decisiones del diseño de datos; los flujos nuevos o modificados deben revisarse y los criterios pendientes siguen abiertos. No hay pruebas ejecutadas. La [arquitectura inicial](../ARCHITECTURE.md) describe los componentes. Se contempla una instalación con varios usuarios y varios nodos por usuario.

## Actores

- **Usuario:** persona autorizada que administra sus nodos y consulta sus datos.
- **Nodo:** prototipo conectado a una bicicleta o motocicleta que detecta eventos y proporciona ubicación cuando puede.
- **Contacto de emergencia:** destinatario configurado para recibir alertas por movimiento no autorizado, impacto o caída.
- **ECU 911:** destinatario previsto sujeto a verificar factibilidad y canal de integración; no se asume una conexión real.
- **Operador de instalación:** persona que despliega y opera la infraestructura; no implica un rol de administrador dentro de la aplicación.

## Índice

| ID | Caso de uso | Actor principal |
|---|---|---|
| CU-01 | Acceder a la plataforma | Usuario |
| CU-02 | Vincular y consultar nodos | Usuario |
| CU-03 | Configurar contactos de emergencia | Usuario |
| CU-04 | Solicitar ubicación de un nodo | Usuario |
| CU-05 | Detectar y registrar movimiento no autorizado | Nodo |
| CU-06 | Detectar y registrar impacto o caída | Nodo |
| CU-07 | Notificar una emergencia | Nodo y sistema, tras CU-05 o CU-06 |
| CU-08 | Consultar historial de eventos | Usuario |
| CU-09 | Desplegar y operar una instalación | Operador de instalación |
| CU-10 | Gestionar vehículos y reasignar nodos | Usuario |
| CU-11 | Eliminar eventos o solicitudes de ubicación | Usuario |
| CU-12 | Eliminar cuenta y revocar nodos | Usuario |

## CU-01 — Acceder a la plataforma

**Objetivo:** permitir el registro y el acceso a datos y funciones autorizados. **Precondición para iniciar sesión:** existe una cuenta registrada con correo verificado.

1. El usuario se registra con correo y contraseña y verifica su correo antes de usar la cuenta.
2. El usuario inicia sesión con correo y contraseña; el sistema verifica su identidad y permite el acceso a sus recursos.
3. Si olvida su contraseña, solicita su recuperación mediante un enlace enviado por correo.

**Alternativa:** si falla la autenticación o el correo no está verificado, se deniega el acceso protegido. **Resultado:** sesión autorizada o acceso rechazado. Se prevén JWT de acceso, token de renovación y registro por sesión en PostgreSQL; duraciones, protección, proveedor de correo y revocación del JWT emitido siguen pendientes.

## CU-02 — Vincular y consultar nodos

**Objetivo:** asociar uno o varios nodos con un usuario y consultarlos. **Precondición:** usuario autenticado y nodo identificable.

1. El usuario inicia la vinculación de un nodo.
2. El sistema comprueba la autorización y registra la asociación.
3. El usuario consulta sus nodos asociados y la información disponible.

**Alternativas:** si el nodo no existe, no es accesible o no puede vincularse, se informa y no se crea la asociación. **Resultado:** asociación registrada o rechazada. Aprovisionamiento y transferencia: pendientes. Inicialmente no se permite compartir nodos.

## CU-03 — Configurar contactos de emergencia

**Objetivo:** mantener uno o varios contactos destinatarios. **Precondición:** usuario autenticado.

1. El usuario añade o modifica sus contactos: nombres, apellidos, correo y teléfono obligatorios; cédula opcional.
2. Selecciona para cada nodo propio los contactos que desee; un contacto puede asignarse a varios nodos.
3. El sistema valida propiedad y duplicados por lista, guarda la configuración e inicia la sincronización con el nodo.
4. El sistema muestra si la lista del nodo está sincronizada o pendiente.

**Alternativas:** datos inválidos o fallo de guardado: se informa sin confirmar el cambio. Un nodo puede no tener contactos; se advierte que no habrá avisos a contactos. Desconectado, el nodo conserva la última lista recibida hasta sincronizarla. **Resultado:** configuración guardada y estado de sincronización conocido; consentimiento y protocolo detallado pendientes.

## CU-04 — Solicitar ubicación de un nodo

**Objetivo:** obtener las coordenadas del vehículo. **Precondición:** usuario autenticado y autorizado para el nodo.

1. El usuario solicita la ubicación desde el frontend.
2. El backend autoriza la solicitud y la envía al nodo mediante MQTT.
3. El nodo intenta obtener y comunicar las coordenadas.
4. El sistema registra la solicitud y su respuesta y presenta el resultado y, cuando esté disponible, su momento de obtención. Se conservan hasta que el usuario decida eliminarlos.

**Alternativas:** nodo desconectado, espera agotada o ubicación no disponible: el sistema informa que no dispone de una respuesta actual; no presenta una posición antigua como actual. **Resultado:** coordenadas disponibles o estado de indisponibilidad. Tiempo de espera y uso de última posición: pendientes.

## CU-05 — Detectar y registrar movimiento no autorizado

**Objetivo:** informar al usuario de un posible movimiento no autorizado. **Precondición:** nodo operativo y condiciones de detección aplicables; autorización y activación están por definir.

1. El nodo detecta un movimiento que cumple los criterios establecidos, genera un UUID estable y guarda el evento en la cola persistente local.
2. Inicia el intento SMS del CU-07 sin depender de MQTT y publica el evento mediante MQTT cuando sea posible.
3. El backend procesa y registra el evento, confirma la persistencia al nodo y gestiona el correo y el aviso al usuario.

**Alternativas:** sin conectividad o confirmación de aplicación, el nodo conserva el evento y reintenta; los detalles de reintentos y comunicación de fallos de notificación quedan pendientes. **Resultado:** evento registrado y aviso gestionado cuando los componentes están disponibles; la entrega no está garantizada.

## CU-06 — Detectar y registrar impacto o caída

**Objetivo:** identificar y registrar un posible impacto o caída. **Precondición:** nodo operativo; criterios de clasificación pendientes.

1. El nodo detecta un evento, genera un UUID estable y lo guarda en su cola persistente.
2. Inicia el intento SMS del CU-07 sin depender de MQTT y comunica el evento cuando sea posible.
3. El backend registra el evento de forma idempotente, confirma la persistencia al nodo y gestiona el correo del CU-07.

**Alternativas:** datos insuficientes, ubicación o comunicación no disponible: se debe informar o registrar el estado según diseño pendiente. **Resultado:** evento registrado cuando hay conectividad; no se presume una detección infalible.

## CU-07 — Notificar una emergencia

**Objetivo:** avisar de movimiento no autorizado, impacto o caída a contactos configurados mediante SMS del nodo y correo del backend; contemplar ECU 911 sujeto a viabilidad. **Disparador:** evento de CU-05 o CU-06; la política de cancelación está pendiente.

1. El nodo intenta SMS a los contactos de su última lista recibida, aun sin MQTT; requiere servicio y cobertura celular.
2. Al procesar el evento, el backend intenta correo a los contactos vigentes, aunque el evento haya llegado tarde.
3. Cada intento registra su resultado conocido; el nodo sincroniza los resultados de SMS cuando pueda. El contenido y las coordenadas disponibles se definirán sin inventar datos.

**Alternativas:** sin contactos no se envían avisos a contactos; se informa al usuario. Sin cobertura celular, el nodo conserva el SMS pendiente e intenta de nuevo cuando vuelva la cobertura; límites y resultados inciertos están pendientes. Sin ubicación se informa su ausencia. No se debe afirmar que el destinatario recibió la alerta sin evidencia. **Resultado:** intento y resultado conocido registrados. El envío directo al ECU 911 solo podrá implementarse y probarse tras verificar el canal y sus condiciones; mientras tanto es una intención no validada.

## CU-08 — Consultar historial de eventos

**Objetivo:** revisar eventos de nodos autorizados. **Precondición:** usuario autenticado y eventos almacenados, si existen.

1. El usuario selecciona un nodo y solicita su historial.
2. El sistema verifica permisos y muestra los eventos disponibles y su estado conocido.

**Alternativas:** sin eventos o fallo de consulta: se informa el estado correspondiente. **Resultado:** historial autorizado mostrado o consulta fallida. Eventos sin TTL; filtros pendientes.

## CU-09 — Desplegar y operar una instalación

**Objetivo:** instalar los componentes en infraestructura local o cloud y preparar nodos propios. **Precondición:** infraestructura, hardware y documentación adecuados disponibles.

1. El operador despliega broker, backend, base de datos y frontend.
2. Configura conectividad y seguridad, y prepara los nodos para la instalación.
3. Comprueba el funcionamiento mediante pruebas definidas.

**Alternativa:** un componente o conexión falla: se informa y se corrige antes de dar por operativo el flujo. **Resultado:** instalación preparada o fallo identificado. Pasos de instalación, monitorización, copias de seguridad y recuperación: pendientes de diseño.

## CU-10 — Gestionar vehículos y reasignar nodos

**Objetivo:** mantener vehículos propios y asociarles un nodo sin alterar el historial. **Precondición:** usuario autenticado y propietario de los recursos.

1. El usuario registra un vehículo con alias y tipo; placa, marca y modelo son opcionales. Puede crear marcas y modelos para el catálogo compartido.
2. Opcionalmente añade hasta diez fotografías privadas JPEG o PNG de hasta 10 MB cada una y selecciona una principal.
3. Para reasignar un nodo, el sistema sincroniza sus eventos pendientes y completa la transición coordinada antes de asociarlo a otro vehículo; como máximo habrá un nodo activo por vehículo.
4. Si se retira un vehículo, sus eventos históricos no se borran y una placa previamente utilizada puede reutilizarse según las reglas acordadas.

**Alternativas:** placa activa duplicada, acceso ajeno o foto inválida: se rechaza la operación. Sin sincronización confirmada no se completa la reasignación. Si se elimina la foto principal, la más antigua restante pasa a ser principal. **Pendiente:** protocolo de barrera, manejo de nodo dañado, almacenamiento y desempate de fotos.

## CU-11 — Eliminar eventos o solicitudes de ubicación

**Objetivo:** permitir eliminar registros propios. **Precondición:** usuario autenticado y propietario del nodo asociado.

1. El usuario selecciona un evento o solicitud de ubicación propia y solicita su eliminación.
2. El sistema comprueba la autorización y elimina el registro; para un evento elimina también sus intentos de aviso y conserva una marca mínima mientras pueda aceptarse un reenvío.
3. Las solicitudes y respuestas se conservan hasta que el usuario decida eliminarlas; los eventos no tienen TTL.

**Alternativas:** si un evento borrado se reenvía, no se recrea ni dispara efectos duplicados. **Pendiente:** manejo de envíos en curso, respuestas tardías, criterio verificable para retirar marcas y operación concurrente.

## CU-12 — Eliminar cuenta y revocar nodos

**Objetivo:** eliminar la cuenta, sus datos personales y eventos y desvincular los nodos. **Precondición:** usuario autenticado que confirma expresamente la eliminación.

1. El sistema marca la cuenta pendiente y bloquea sus acciones y el procesamiento de eventos asociados.
2. Conserva el trabajo necesario e intenta revocar las credenciales MQTT de todos los nodos.
3. Tras confirmar las revocaciones, completa el borrado de datos y desvincula los nodos; un nodo registrado de nuevo recibirá credenciales nuevas.

**Alternativa:** si no se confirma la revocación, la eliminación permanece pendiente y se reintenta; no se asegura que el broker haya desconectado el nodo antes de confirmarlo. **Pendiente o fuera del MVP:** respaldos, restauración y fallos permanentes que requieren intervención.

## Validación y decisiones abiertas

Los casos de uso no sustituyen los [**10 escenarios de validación propuestos**](escenarios-de-prueba.md): estos deben completarse y ejecutarse, registrando entradas, resultado esperado, resultado observado, aciertos, omisiones y falsas alarmas. También deberán cubrir ubicación y notificaciones sin asumir integración real con ECU 911.

Las decisiones de datos, fotos, retención y eliminación se detallan en [decisiones para el diseño de datos](decisiones-diseno-datos.md). Quedan por acordar los detalles de registro y correo, la vinculación y transferencia de nodos, la reasignación segura entre vehículos, la definición de movimiento no autorizado, la política de cancelación de alertas, la implementación de correo y SMS, la conectividad, el tratamiento de fallos y la privacidad de la ubicación.

La matriz de relación entre casos de uso, requisitos y escenarios, junto con las brechas de prueba conocidas, se mantiene en el [apéndice B de la ERS](requisitos-ieee830.md#b-estado-de-trazabilidad).
