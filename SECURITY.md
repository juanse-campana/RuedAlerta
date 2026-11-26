# Seguridad de RuedAlerta

Esta política es una base inicial para todo el repositorio: backend, frontend, broker, nodo e infraestructura. El proyecto está en definición y todavía no se han validado sus mecanismos de seguridad. El [modelo inicial de amenazas](docs/RuedAlerta-threat-model.md) describe los riesgos previstos y las mitigaciones propuestas; no constituye una auditoría ni confirma vulnerabilidades.

## Reportar una vulnerabilidad

**Canal privado pendiente de definir.** No publiques detalles, credenciales, datos personales ni instrucciones de explotación en issues públicos. Hasta que exista un canal privado verificado, contacta de forma privada a las personas responsables del repositorio por un medio que ya hayas confirmado con ellas. Si no dispones de uno, conserva la información sin publicarla hasta que se anuncie un canal.

Cuando esté disponible el canal, describe el componente afectado, el impacto observado, los pasos mínimos para reproducir el problema y, si corresponde, una versión o revisión. No incluyas secretos, datos reales de ubicación ni información de terceros; utiliza datos de prueba. La forma de confirmación, los tiempos de respuesta y la política de divulgación coordinada aún deben establecerse.

## Versiones compatibles

Aún no se ha definido qué versiones reciben soporte de seguridad ni sus periodos de mantenimiento. Esta información se documentará cuando se acuerde.

## Principios de seguridad

Estos son objetivos de diseño y verificación, no garantías de una implementación existente:

- Autenticar personas y nodos; verificar en el backend que cada usuario esté autorizado para consultar o modificar el nodo y los datos solicitados.
- Diseñar credenciales únicas y revocables por nodo, con permisos limitados a sus operaciones y temas MQTT autorizados. El aprovisionamiento, almacenamiento, rotación y revocación están pendientes de definición.
- Proteger las comunicaciones y restringir el acceso a las interfaces expuestas a internet. Definir expresamente cuáles son públicas; mantener la base de datos y las interfaces de administración privadas por defecto como objetivo de diseño, sujeto al despliegue elegido.
- Autorizar y validar los cambios en contactos de emergencia y configuración de alertas; diseñar un registro de auditoría que evite exponer datos sensibles.
- Mantener credenciales y secretos fuera del código, de los registros y del control de versiones.
- Proteger las coordenadas, contactos y demás datos personales; definir permisos, retención y eliminación.
- Revisar dependencias y configuraciones, y planificar actualizaciones, copias de seguridad y recuperación.
- Evaluar desconexiones, mensajes duplicados, falsas alarmas y fallos de notificación.

La integración directa con ECU 911 sigue sujeta a validación. El prototipo no sustituye a los servicios de emergencia y no garantiza la entrega de alertas.

## Requisitos de seguridad pendientes por decisiones recientes

- Proteger el acceso a imágenes privadas del propietario también frente a acceso directo por URL; validar carga y contenido de archivos. El proveedor y mecanismo de autorización siguen pendientes.
- Proteger y sincronizar los teléfonos almacenados en el nodo; un contacto eliminado podría recibir SMS hasta que el cambio se aplique. No registrar contraseñas, teléfonos, coordenadas ni contenido sensible innecesariamente.
- Al eliminar cuentas, bloquear procesamiento y coordinar revocación de credenciales MQTT antes de finalizar; no afirmar revocación si el broker no la confirmó. Retención de respaldos y fallos permanentes quedan pendientes o fuera del MVP.
- Eliminar datos de contacto de intentos conservados cuando se borra el contacto y proteger las marcas mínimas que evitan recreación de eventos; especificación y pruebas pendientes.

Estos son requisitos de diseño, no controles implementados o validados. Véanse las [decisiones de datos](docs/decisiones-diseno-datos.md).

## Antes de desplegar

El procedimiento concreto dependerá de las tecnologías y la arquitectura elegidas. Antes de exponer una instalación, se deberá verificar la autenticación y autorización, la protección de comunicaciones, la gestión de secretos, la privacidad de datos y la recuperación ante fallos.
