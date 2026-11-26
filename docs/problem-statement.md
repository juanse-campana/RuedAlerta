# Definición de la problemática

Este documento establece el problema que el proyecto busca abordar, sus beneficiarios y los límites de la validación del prototipo. El alcance contempla bicicletas y motocicletas, tres eventos, consulta de ubicación y alertas de emergencia; la validación propuesta no equivale a demostrar desempeño universal.

## Contexto

Una bicicleta o motocicleta puede estar estacionada o circulando en distintos entornos. Ante un movimiento no autorizado, un impacto o una caída, la persona usuaria puede no recibir una alerta oportuna ni conocer las coordenadas del vehículo. En una caída o un choque, la falta de aviso con la ubicación puede retrasar la respuesta de sus contactos de emergencia o de los servicios de emergencia.

El planteamiento inicial menciona estacionamientos universitarios y zonas urbanas de Loja como contexto posible. El alcance previsto por el proyecto no se limita a una ciudad, a estacionamientos universitarios ni a un tipo específico de vía: considera estacionamientos de cualquier tipo y vías en general. Esta amplitud describe el uso al que se aspira; no afirma que el prototipo ya haya sido probado en todos esos contextos.

## Problema central

> Las personas usuarias de bicicletas y motocicletas pueden no recibir una notificación oportuna cuando su vehículo es movido sin autorización, sufre un impacto o se cae; además, pueden no disponer de un mecanismo para solicitar sus coordenadas o para hacer llegar una alerta de emergencia con ubicación a quienes puedan asistirles. El proyecto busca atender estas necesidades mediante un prototipo, sin dar por demostrada de antemano su eficacia en todos los vehículos, estacionamientos o vías.

## Pregunta del proyecto

¿Cómo prototipar un sistema IoT que detecte y notifique el movimiento no autorizado, los impactos y las caídas de bicicletas y motocicletas; permita solicitar sus coordenadas; y gestione alertas a contactos de emergencia configurables, considerando una posible integración con el ECU 911? ¿Cómo evaluar esas funciones en escenarios representativos?

## Beneficiarios

- **Personas ciclistas y motociclistas:** podrían solicitar la ubicación de su vehículo y recibir avisos ante los eventos considerados.
- **Contactos de emergencia configurados:** podrían recibir información del incidente y la ubicación disponible para apoyar al usuario.
- **Servicios de emergencia, incluido el ECU 911:** serían destinatarios previstos de alertas por choque o caída, sujeto a validar el canal de integración.
- **Responsables de estacionamientos:** podrían beneficiarse de una notificación sobre eventos que afecten a los vehículos bajo su cuidado.

## Eventos incluidos y prioridad

Los tres eventos forman parte del alcance del problema. El orden indica prioridad de atención y validación, no exclusión de los eventos posteriores:

1. **Movimiento no autorizado** de una bicicleta o motocicleta.
2. **Impacto** sobre el vehículo.
3. **Caída** del vehículo.

Para poder evaluar estos eventos, el desarrollo tendrá que definir cómo distinguir cada uno de un movimiento normal y qué condiciones se considerarán una alerta correcta o una falsa alarma. Esas definiciones todavía deben acordarse; este documento no fija umbrales ni mecanismos de autorización.

## Ubicación y alertas de emergencia

Además de detectar los tres eventos, el alcance funcional previsto incluye:

- Permitir que una persona usuaria autorizada solicite las coordenadas de ubicación de su bicicleta o motocicleta.
- Ante movimiento no autorizado, impacto o caída, intentar avisar a contactos mediante SMS del nodo y correo del backend, con el tipo de evento y las coordenadas disponibles según se definan.
- Permitir configurar uno o varios contactos de emergencia como destinatarios y contemplar también el envío de la alerta al ECU 911.

La fuente de ubicación, vigencia y precisión de las coordenadas, implementación y proveedores de correo y SMS quedan por definir. Los SMS requerirán cobertura celular, servicio y hardware todavía no seleccionados. La integración directa con el ECU 911 es un objetivo por validar; no se afirma que el prototipo ya tenga acceso a un canal compatible ni que la entrega esté garantizada.

## Relación con la solución propuesta

La problemática es la posible falta de aviso oportuno y de acceso a la ubicación; las tecnologías son medios propuestos para abordarla, no resultados ya comprobados. La [arquitectura global](../ARCHITECTURE.md) describe los nodos ESP32, la comunicación MQTT, el broker Mosquitto, el backend NestJS con TypeScript, PostgreSQL y el frontend Next.js. El frontend está inicializado como proyecto base; las funciones del sistema aún no están implementadas ni validadas.

Los sensores y la fuente de ubicación están en evaluación; el [diseño preliminar del nodo](../apps/node/docs/materiales.md) presenta una propuesta de laboratorio. Wokwi es una posible herramienta de simulación, sujeta a verificar la compatibilidad de los módulos. Los canales de correo y SMS son requisitos previstos, no implementados ni validados; la integración con el ECU 911 sigue pendiente de validación.

## Enfoque no comercial y despliegue propio

El proyecto no tiene como objetivo generar lucro. Se concibe para que cada usuario, equipo o institución pueda levantar la solución en infraestructura propia, ya sea local (on-premises) o cloud, y construir y configurar su propio prototipo funcional siguiendo los materiales técnicos del proyecto. La solución no dependerá de que el usuario contrate una instancia central operada por el proyecto.

El carácter no lucrativo no implica que construir u operar el prototipo sea necesariamente gratuito: el hardware, la conectividad, los proveedores cloud y los servicios externos pueden generar costos para quien los utilice. La licencia del software y las condiciones de modificación o redistribución deberán definirse aparte; no se deducen únicamente de este enfoque.

## Alcance del proyecto

Esta delimitación describe el alcance previsto del prototipo inicial, no capacidades ya demostradas. Las exclusiones propuestas deben revisarse junto con los casos de uso; no eliminan los objetivos expresamente incluidos en la problemática.

### Qué se busca resolver

- **Eventos:** detectar y comunicar movimiento no autorizado, impacto y caída en bicicletas y motocicletas, respetando el orden de prioridad ya indicado y con criterios de detección aún por definir.
- **Ubicación:** permitir a una persona autorizada solicitar las coordenadas disponibles de su vehículo, distinguiendo una respuesta actual de una ubicación antigua o no disponible.
- **Alertas:** gestionar avisos al usuario y, ante cualquiera de los tres eventos, intentar SMS y correos a contactos de emergencia configurables. Se contempla el aviso al ECU 911 como objetivo sujeto a validar la existencia y condiciones de un canal compatible; no se promete una integración operativa antes de esa validación.
- **Gestión:** contemplar múltiples usuarios y varios nodos por usuario, junto con la consulta autorizada de nodos y eventos registrados.
- **Prototipo y despliegue:** desarrollar una solución no lucrativa que cada usuario o institución pueda instalar en infraestructura propia local o cloud y acompañar con un nodo construido para su vehículo. La [arquitectura inicial](../ARCHITECTURE.md) describe los componentes previstos.
- **Validación:** definir y ejecutar 10 escenarios de prueba, registrando resultados, aciertos, omisiones y falsas alarmas, bajo las condiciones concretas de cada escenario.

### Qué queda fuera del alcance inicial propuesto

- Prevenir físicamente un robo, recuperar el vehículo o intervenir sobre él, por ejemplo mediante bloqueo o inmovilización.
- Diagnosticar lesiones, prestar asistencia médica o sustituir una llamada de emergencia y la respuesta de los servicios competentes.
- Operar una plataforma central comercial o vender un servicio gestionado como condición para utilizar el proyecto.
- Implementar desde el inicio un clúster de brokers, múltiples instancias del backend o una arquitectura de alta disponibilidad; la arquitectura inicial contempla una instancia de cada componente de servidor.
- Demostrar mediante el prototipo que funciona en todos los vehículos, estacionamientos, carreteras o condiciones ambientales, o garantizar cobertura, ubicación, detección y entrega en todo momento.

### Sujeto a definición o validación

Los mecanismos de detección, conectividad, fuente de ubicación, implementación de SMS y correo, seguridad y manejo de desconexiones se definirán durante el diseño. La integración con ECU 911 **no está descartada**, pero su implementación y prueba real dependen de verificar su viabilidad. Los casos de uso se detallan en [casos-de-uso.md](casos-de-uso.md).

El planteamiento original proponía elegir un vehículo y un evento principal; el alcance conversado ahora abarca dos tipos de vehículo y tres eventos. La compatibilidad de esta ampliación con los criterios de evaluación del proyecto debe confirmarse.

## Alcance de la validación

El brief del proyecto propone validar **10 escenarios** y registrar aciertos, eventos omitidos y falsas alarmas. Los [10 escenarios propuestos](escenarios-de-prueba.md) están pendientes de concretar y ejecutar; deberán incluir la detección de eventos, la solicitud de ubicación y el envío de alertas a sus destinatarios, incluidos los límites de disponibilidad de coordenadas y de conectividad. Estos casos servirán como una comprobación representativa; por sí solos, no demuestran que el dispositivo funcione con la misma eficacia en cualquier modelo de bicicleta o motocicleta, estacionamiento, superficie, vía o condición ambiental.

Para que los resultados sean interpretables, cada escenario deberá indicar el evento o solicitud esperada, las coordenadas obtenidas (si están disponibles), los destinatarios previstos y la respuesta observada. Se registrará si la alerta fue correcta, omitida, falsa o llegó a un destinatario incorrecto. Los resultados describirán únicamente esos escenarios; no se deben presentar como tasas universales de detección ni como garantía de entrega a servicios de emergencia.

## Delimitación y continuidad

La problemática queda delimitada por los vehículos, eventos, beneficiarios y contextos previstos descritos en este documento. La siguiente fase, de diseño y validación, deberá operacionalizar estas condiciones; no son vacíos en la definición del problema:

- Distinguir las condiciones de uso autorizado y no autorizado.
- Establecer criterios observables para clasificar impactos y caídas.
- Completar y ejecutar los 10 escenarios propuestos, incluidos casos con alerta esperada y casos sin alerta.
- Precisar el tiempo de notificación que se medirá y cómo se registrará.
- Seleccionar entornos representativos donde se ejecutarán las pruebas del prototipo.
- Definir la fuente, precisión y vigencia de las coordenadas, así como quién puede solicitarlas.
- Precisar cómo se configurarán los contactos, qué datos contendrá la alerta y cómo se protegerá la ubicación.
- Validar la factibilidad, el canal y el procedimiento de notificación directa al ECU 911.

## Límite de las afirmaciones

El brief no aporta datos de frecuencia de incidentes ni resultados de pruebas. Por tanto, este documento no cuantifica la prevalencia del problema ni afirma que el dispositivo reduzca robos, daños o lesiones. Tampoco afirma que exista una integración operativa con el ECU 911 o que siempre sea posible obtener y transmitir coordenadas. Esos resultados y capacidades requerirían evidencia y validación adicional.
