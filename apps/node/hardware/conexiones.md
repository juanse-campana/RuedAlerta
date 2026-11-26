# Conexiones preliminares del nodo

> **Actualización de alcance:** el diagrama preliminar aún no incluye el módem celular ni su alimentación, antena y SIM para los SMS acordados. No es un circuito completo ni validado para ese requisito.

**No es un esquema eléctrico definitivo ni una instrucción lista para energizar.** Es una propuesta de conexiones de mesa para una placa ESP32-DevKitC con módulo **ESP32-WROOM-32** y módulos cuya alimentación y señales se confirmen compatibles. Revisar las hojas de datos y medir tensiones antes de conectar. La [lista de materiales](../docs/materiales.md) registra costos y componentes pendientes.

## Diagrama lógico de conexiones

```text
Fuente USB regulada ── cable USB ──> ESP32 DevKit (una sola fuente)
                                       │
               ┌───────────────────────┼────────────────────────┐
               │                       │                        │
            IMU I²C                 GPS UART               Vibración digital
        MPU-6050 GY-521             NEO-6M                  módulo por elegir
        SDA ───── GPIO21            TX ─────> GPIO16 RX     OUT ─────> GPIO27
        SCL ───── GPIO22            RX <───── GPIO17 TX*    GND ────── GND
        GND ───── GND               GND ───── GND           VCC ────── ver nota
        VCC ───── ver nota          VCC ───── ver nota

      Alimentación de módulos: pendiente de confirmar para cada placa.
      Solo conectar señales con niveles compatibles con el ESP32.
      * GPIO17 → GPS RX solo si hace falta configurar el GPS y es compatible.
```

Las líneas `VCC` no están conectadas en el diagrama porque su conexión depende de la placa exacta y del presupuesto de corriente. No energizar hasta completar esa validación; la tabla siguiente define la interfaz propuesta, no las tensiones de alimentación definitivas.

| Señal | Conexión propuesta | Comprobación necesaria |
|---|---|---|
| IMU SDA / SCL | GPIO21 / GPIO22 | Confirmar pull-ups del bus a tensión compatible con ESP32; evitar pull-ups a 5 V. |
| GPS TX | GPIO16 (recepción) | Confirmar que la salida UART del módulo no supere los límites del ESP32. |
| GPS RX, opcional | GPIO17 (transmisión) | Confirmar nivel de entrada del módulo; omitir si solo se leen datos y no se necesita configurar. |
| Vibración OUT | GPIO27 (entrada) | Elegir módulo con nivel de salida compatible; comprobar tensión de salida en ambos estados. |
| GND | GND común entre módulos y ESP32 | Verificar continuidad antes de energizar. |
| Alimentación VCC de módulos | **Por definir** | Verificar rangos y corriente reales de cada placa y capacidad de la fuente/regulador; confirmar esquemático de la variante antes de cablear. |

GPIO16/17 pueden estar reservados en otras variantes de ESP32; comprobar la placa concreta. La [guía de Espressif](https://documentation.espressif.com/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html) indica que las opciones de alimentación de la placa son mutuamente excluyentes: no conectar varias fuentes simultáneamente.

## Antes de energizar

1. Identificar modelo y hoja de datos de cada placa; confirmar pines, tensión de alimentación, niveles de E/S y corriente máxima disponible.
2. Completar el diseño de alimentación y verificar que el regulador y fuente soporten los consumos y picos. Si un módulo requiere otro voltaje o sus señales no son compatibles, diseñar una fuente o adaptación de niveles adecuada; no improvisarla.
3. Con la alimentación desconectada, comprobar continuidad de GND y ausencia de cortocircuitos. Después verificar tensiones con multímetro antes de conectar señales a GPIO.
4. Usar una sola fuente USB de mesa, conforme a la placa, y comprobar cada módulo por separado antes de integrarlos.

El LED opcional no está cableado: se definirá GPIO, resistencia y cálculo cuando se seleccione el LED. No conectar zumbadores, baterías de litio o alimentación del vehículo sin diseñar sus circuitos y protecciones. No existe firmware ni simulación funcional en este documento.
