# Materiales y costos preliminares del nodo

> **Actualización de alcance:** la lista y el subtotal siguientes describen solo el montaje preliminar Wi-Fi; no incluyen el módem celular, SIM, antena, alimentación, servicio ni costos necesarios para los SMS directos acordados. La selección, cotización y compatibilidad móvil están pendientes; no es una lista completa del MVP.

**Estado:** propuesta de prototipo de mesa, no lista definitiva de compra ni dispositivo listo para instalar en un vehículo. El [diagrama de conexiones](../hardware/conexiones.md) es preliminar y debe verificarse con las placas concretas antes de alimentar el circuito.

## Objetivo y limitaciones

Probar un ESP32 con medición de movimiento, vibración y ubicación, y comunicación MQTT mediante una red Wi-Fi de laboratorio. La Wi-Fi no garantiza comunicación mientras el vehículo circula; la solución de conectividad móvil, su costo y consumo están pendientes. El GPS recibe ubicación, **no proporciona conexión a internet**. Este montaje no demuestra detección fiable de accidentes ni reemplaza un sistema de emergencia.

## Lista de materiales y precios de referencia

Precios en dólares estadounidenses consultados el 25 de noviembre de 2026; pueden cambiar según vendedor, impuestos, disponibilidad y envío a Loja. La cantidad es una por nodo salvo indicación. Los precios con fuente son referencias, no cotizaciones ni garantía de que los productos sean compatibles entre sí.

| Componente candidato | Cant. | Función | Precio unitario / subtotal | Fuente o estado |
|---|---:|---|---:|---|
| Placa de desarrollo ESP32 con módulo WROOM-32 | 1 | Procesamiento y conexión Wi-Fi | USD 11,00 | [Mercado Libre Ecuador](https://www.mercadolibre.com.ec/esp32-devkit-v1-wifi-y-bluetooth/p/MEC2038887439); confirmar variante y pines. |
| IMU MPU-6050 GY-521 | 1 | Aceleración y giro | USD 3,35 | [Mercado Libre Ecuador](https://www.mercadolibre.com.ec/modulo-sensor-acelerometro-giroscopio-mpu-6050-gy-521/p/MEC2039721958); verificar alimentación y pull-ups del módulo. |
| Módulo GPS NEO-6M con antena | 1 | Obtener coordenadas cuando haya señal | USD 21,46 | [Tesla Industrial Ecuador](https://www.tesla.com.ec/product-page/modulo-gps-arduino-neo-6m-sim800l); la publicación menciona SIM800L en el título: confirmar contenido, antena y especificación exacta antes de comprar. |
| Módulo de vibración SW-420 | 1 | Señal complementaria de vibración | USD 2,50 | [Electronics Ecuador](https://electronicsecuador.com/product/sensor-de-vibracion-alarma-sw-420/); confirmar disponibilidad y medir salida con alimentación de 3,3 V antes de conectarlo. |
| Kit de protoboard 830 puntos y 65 cables | 1 | Montaje temporal de mesa | USD 6,25 | [Plexylab](https://www.plexylab.com/shop/kit-protoboard-830-puntos-mb102-fuente-de-5v-y-3-3v-juego-de-65-cables-1982); confirmar compatibilidad y tipos de cables. Incluye módulo de alimentación, cuyo uso no se ha validado. |
| Cargador USB 5 V / 2 A sin cable | 1 | Alimentación de mesa | USD 2,30 | [IDK Manager Ecuador](https://tienda.idkmanager.com/ec/products/cargador-usb-a-tcl-uc13us-5v-2a-sin-cable); confirmar compatibilidad con la placa elegida. |
| Cable USB de datos micro-USB, 30 cm | 1 | Alimentación y programación | USD 1,00 | [Plexylab](https://www.plexylab.com/shop/cable-micro-usb-a-usb-para-alimentacion-y-datos-color-azul-2261); confirmar que el conector coincida con la placa. |
| LED de 5 mm | 1 | Indicador local opcional | USD 0,05 | [Plexylab](https://www.plexylab.com/shop/led-de-5-mm-1479); verificar características eléctricas del LED elegido. |
| Resistencia de ¼ W | 1 | Limitar corriente del LED | Desde USD 0,03 | [Plexylab](https://www.plexylab.com/shop/resistencia-de-14-w-tolerancia-1-2404); seleccionar y verificar el valor adecuado antes de comprar. |
| Carcasa y sujeción | 1 juego | Protección y montaje posteriores | Por cotizar | Dimensiones, disponibilidad y protección para intemperie y vibración pendientes de validar. |

**Subtotal parcial orientativo: desde USD 47,94** (11,00 + 3,35 + 21,46 + 2,50 + 6,25 + 2,30 + 1,00 + 0,05 + 0,03). El importe combina referencias de vendedores distintos y utiliza el precio mínimo publicado de la resistencia; no es una cotización completa. Faltan carcasa, sujeción, posibles cables o adaptadores adicionales, envío e impuestos cuando correspondan. Los equipos de prueba, batería, conectividad móvil y plan de datos se presupuestarán aparte. Los precios y disponibilidad deben confirmarse antes de comprar.

El kit incluye un módulo de alimentación: **no lo conectes simultáneamente con la alimentación USB del ESP32** sin un diseño de alimentación validado. La placa, el kit y los módulos siguen sujetos a verificar voltajes, niveles de señal, corriente y conexiones; consulta el [diagrama preliminar](../hardware/conexiones.md).

## Consideraciones antes de seleccionar o comprar

- El MPU-6050 es una IMU candidata para el prototipo; su sensibilidad y rango deben validarse con pruebas. Una vibración o inclinación, por sí sola, no demuestra un choque o caída.
- Confirmar que la placa ESP32 concreta exponga los pines propuestos y permita la alimentación requerida por los módulos. La disponibilidad de GPIO16/17 depende de la variante; revisar la [guía del ESP32-DevKitC](https://documentation.espressif.com/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html).
- Los módulos comerciales pueden diferir del chip: comprobar alimentación, niveles de señales y consumo del módulo concreto. La [especificación del MPU-6050](https://files.waveshare.com/upload/a/a7/MPU-6000-and-MPU-6050-Product-Specification.pdf) describe el chip, no garantiza las características de cualquier placa GY-521.
- Antes de uso móvil, definir fuente protegida, autonomía, carcasa, red y conectividad. No conectar directamente a la batería de una motocicleta ni montar un prototipo de mesa en circulación.
- El alcance de simulación Wokwi para cada módulo y la sustitución de sensores no simulados están por verificar.
