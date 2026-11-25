# Definición de la problemática

Este documento establece el problema que el proyecto busca abordar, sus beneficiarios y los límites de la validación del prototipo. El alcance contempla bicicletas y motocicletas, tres eventos y distintos entornos de uso; la validación propuesta no equivale a demostrar desempeño universal.

## Contexto

Una bicicleta o motocicleta puede estar estacionada o circulando en distintos entornos. Ante un movimiento no autorizado, un impacto o una caída, la persona usuaria puede no recibir una alerta oportuna. La falta de aviso puede retrasar que conozca el evento y reaccione.

El planteamiento inicial menciona estacionamientos universitarios y zonas urbanas de Loja como contexto posible. El alcance previsto por el proyecto no se limita a una ciudad, a estacionamientos universitarios ni a un tipo específico de vía: considera estacionamientos de cualquier tipo y vías en general. Esta amplitud describe el uso al que se aspira; no afirma que el prototipo ya haya sido probado en todos esos contextos.

## Problema central

> Las personas usuarias de bicicletas y motocicletas pueden no recibir una notificación oportuna cuando su vehículo es movido sin autorización, sufre un impacto o se cae. El proyecto busca atender esa falta de aviso mediante un prototipo que detecte y comunique esos eventos, sin dar por demostrada de antemano su eficacia en todos los vehículos, estacionamientos o vías.

## Pregunta del proyecto

¿Cómo prototipar un dispositivo IoT que detecte y notifique a tiempo el movimiento no autorizado, los impactos y las caídas de bicicletas y motocicletas, y cómo evaluar sus aciertos y falsas alarmas en escenarios de prueba representativos?

## Beneficiarios

- **Personas ciclistas y motociclistas:** podrían recibir aviso ante uno de los eventos considerados.
- **Responsables de estacionamientos:** podrían beneficiarse de una notificación sobre eventos que afecten a los vehículos bajo su cuidado.

## Eventos incluidos y prioridad

Los tres eventos forman parte del alcance del problema. El orden indica prioridad de atención y validación, no exclusión de los eventos posteriores:

1. **Movimiento no autorizado** de una bicicleta o motocicleta.
2. **Impacto** sobre el vehículo.
3. **Caída** del vehículo.

Para poder evaluar estos eventos, el desarrollo tendrá que definir cómo distinguir cada uno de un movimiento normal y qué condiciones se considerarán una alerta correcta o una falsa alarma. Esas definiciones todavía deben acordarse; este documento no fija umbrales ni mecanismos de autorización.

## Problema y solución propuesta

El problema es la ausencia de una notificación oportuna ante los eventos descritos. La arquitectura siguiente es una propuesta de solución para explorar, no una condición del problema ni un resultado ya comprobado:

| Elemento propuesto | Función prevista |
|---|---|
| IMU y sensor de vibración | Medir movimiento, orientación y vibraciones para apoyar la detección. |
| ESP32 | Procesar las lecturas del sensor y generar el evento de alerta. |
| MQTT y broker | Transportar la alerta desde el dispositivo. |
| Node-RED y registro de eventos | Mostrar y guardar las alertas recibidas. |
| LED, zumbador o panel | Presentar una señal local de alerta, según se defina en el diseño. |
| Wokwi | Simular parte del prototipo durante el desarrollo. |

La selección final de componentes, la definición de cada evento y la forma de notificar se detallarán en la documentación de diseño.

## Alcance de la validación

El brief del proyecto propone validar **10 escenarios** y registrar aciertos y falsas alarmas. Estos casos servirán como una comprobación representativa del prototipo bajo las condiciones que se definan para las pruebas. Por sí solos, no demuestran que el dispositivo funcione con la misma eficacia en cualquier modelo de bicicleta o motocicleta, estacionamiento, superficie, vía o condición ambiental.

Para que los resultados sean interpretables, cada escenario deberá indicar el evento esperado, la respuesta observada y si la alerta fue correcta, omitida o falsa. Los resultados describirán únicamente esos escenarios; no se deben presentar como tasas universales de detección.

## Delimitación y continuidad

La problemática queda delimitada por los vehículos, eventos, beneficiarios y contextos previstos descritos en este documento. La siguiente fase, de diseño y validación, deberá operacionalizar estas condiciones; no son vacíos en la definición del problema:

- Distinguir las condiciones de uso autorizado y no autorizado.
- Establecer criterios observables para clasificar impactos y caídas.
- Definir los 10 escenarios, incluidos casos con alerta esperada y casos sin alerta.
- Precisar el tiempo de notificación que se medirá y cómo se registrará.
- Seleccionar entornos representativos donde se ejecutarán las pruebas del prototipo.

## Límite de las afirmaciones

El brief no aporta datos de frecuencia de incidentes ni resultados de pruebas. Por tanto, este documento no cuantifica la prevalencia del problema ni afirma que el dispositivo reduzca robos, daños o lesiones. Esos resultados requerirían evidencia adicional.
