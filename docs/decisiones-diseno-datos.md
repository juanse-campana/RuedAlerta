# Decisiones para el diseño de datos

**Estado:** decisiones funcionales acordadas para orientar el diseño; no son un esquema físico, migración ni evidencia de implementación. La [ERS](requisitos-ieee830.md), la [arquitectura](../ARCHITECTURE.md) y los [requisitos del nodo](../apps/node/docs/requisitos-nodo.md) describen responsabilidades y límites. Las reglas sin definición detallada se señalan como pendientes.

## Cuentas y autorización

- Registro e inicio de sesión mediante correo y contraseña; correo verificado antes de utilizar la cuenta y recuperación mediante enlace enviado por correo. La contraseña no se guarda en texto plano. El teléfono no requiere verificación por SMS en el MVP.
- Nombres, apellidos, correo y teléfono son obligatorios; la cédula es opcional. Correo y teléfono son únicos por instalación; el teléfono incluye código de país. La cédula, cuando se proporciona, también es única por instalación. La normalización exacta y la validación de estos datos están pendientes.
- No hay rol de administrador dentro de la aplicación en el MVP. La operación técnica de la infraestructura es distinta. El usuario solo puede acceder a sus propios nodos; no se comparten inicialmente. Cada nodo tiene un propietario a la vez y un usuario puede tener varios nodos.

## Vehículos, catálogo y fotos

- Un vehículo tiene alias, tipo bicicleta o motocicleta y placa opcional; marca y modelo son opcionales. Si se selecciona un modelo debe corresponder a la marca seleccionada. Marca y modelo forman un catálogo compartido dentro de la instalación; cada modelo pertenece a una marca. Los usuarios pueden crear marcas y modelos, pero no modificar ni eliminar entradas utilizadas por otros usuarios. El resto de permisos y la gestión de duplicados están pendientes.
- La placa no es la identidad interna del vehículo. Entre vehículos activos de una instalación no se admiten placas duplicadas, comparando sin distinguir mayúsculas, espacios ni guiones; varios vehículos pueden no tener placa. Puede reutilizarse tras retirar el vehículo anterior, sin transferir ni exponer su historial. Jurisdicciones y detalles del retiro permanecen pendientes.
- Cada vehículo puede tener como máximo un nodo activo asociado simultáneamente; no se requiere que tenga nodo. El nodo tiene identidad propia y alias opcional. Reasignarlo exige sincronizar y confirmar los eventos pendientes y una transición coordinada que evite atribuir a otro vehículo un evento generado durante el cambio. La solución de barrera y las excepciones siguen pendientes.
- Un vehículo admite de cero a diez fotos JPEG o PNG de hasta 10 MB cada una. El usuario puede elegir una principal; si la elimina, se elegirá la foto restante más antigua; si no quedan fotos, no hay principal. El desempate y la concurrencia quedan pendientes.
- Las imágenes se guardarán fuera de PostgreSQL, potencialmente en un bucket, y la base de datos conservará una URL estable de referencia y los datos de asociación necesarios. El proveedor no se ha elegido. Solo un usuario autenticado y autorizado como propietario podrá ver las fotos, incluso si conoce su URL. El mecanismo privado de acceso, la validación de archivos y la coordinación de borrado quedan por definir.

## Contactos y avisos

- Cada contacto pertenece a la lista del usuario. Son obligatorios nombres, apellidos, correo y teléfono; la cédula es opcional. La unicidad, formato y verificación de los datos del contacto quedan pendientes.
- Un contacto propio se puede asignar a varios nodos del usuario y cada nodo tiene su propia selección. Puede haber nodos sin contactos asignados; el sistema debe advertir que no se enviarán avisos a contactos hasta configurar al menos uno.
- Ante movimiento no autorizado, impacto o caída, el nodo intentará un SMS a todos los contactos de su última lista recibida, independientemente de la conexión MQTT. Requiere módem y servicio celular, SIM y cobertura; no hay garantía de entrega. El backend intentará correo a todos los contactos asignados cuando procese el evento, incluso si llegó tarde; si la hora de ocurrencia no es confiable, no se inventará.
- Los cambios de contactos se sincronizarán con el nodo y se confirmará su aplicación; se mostrará el estado sincronizado o pendiente. Mientras esté desconectado usará la última lista recibida, por lo que un contacto retirado podría recibir un SMS hasta la actualización. Deben definirse el protocolo, la protección de la lista y los estados.
- Se conservará el resultado conocido de cada intento por evento, contacto y canal; no se afirmará entrega sin evidencia. El nodo deberá comunicar los resultados conocidos de SMS cuando vuelva a conectarse. Se necesitan pruebas para garantizar que un reenvío no genere avisos duplicados ni reexponga datos eliminados.
- Si se elimina un contacto, se conservan los intentos anteriores sin sus datos personales. Al borrar un evento se borrarán también sus intentos de aviso. El manejo de envíos en curso, referencias y datos que pudieran aparecer en mensajes de error permanece pendiente.

## Eventos y eliminación

- Se almacenan eventos, no lecturas continuas de sensores. Cada evento tendrá ID estable por nodo, tipo, hora de recepción y hora de ocurrencia cuando sea confiable; la ubicación y su hora de obtención se guardarán cuando estén disponibles. Se preservará el vehículo asociado cuando ocurrió, también ante transmisión tardía.
- No habrá TTL de eventos: se conservarán hasta que el propietario decida borrarlos. El usuario podrá borrar eventos individuales. Se conservará una marca mínima de identificación de cada evento eliminado para que su reenvío no lo recree; contenido, retención y respuesta de la marca están por diseñar. Retirar un vehículo no borrará automáticamente sus eventos.
- La eliminación de cuenta exige confirmación y comprende sus datos personales y eventos, así como desvincular nodos y revocar sus credenciales MQTT. Si un nodo se registra nuevamente recibirá credenciales nuevas.
- La eliminación será un proceso pendiente: se bloquearán acciones y procesamiento asociados, se conservará una tarea para reintentar la revocación MQTT y solo se completará tras confirmarla. Si el broker es inaccesible no se afirmará que el acceso fue revocado. Copias, restauración y tratamiento de fallos que no se resuelven con reintentos quedan pendientes o fuera del MVP; no se garantiza eliminación inmediata en respaldos.

## Precisiones acordadas para el esquema

- Se usarán UUID para identificar usuarios, vehículos, nodos, contactos y solicitudes. El nodo generará un UUID por evento antes de guardarlo y lo conservará en sus reintentos; generación segura y ámbito definitivo pendientes.
- Para las cuentas se comparará el correo sin distinguir mayúsculas y sin espacios al inicio o al final. El teléfono usa `+`, código de país y dígitos sin espacios ni guiones. La cédula opcional se representa como texto de exactamente 10 dígitos; aún no se ha decidido validar su dígito verificador.
- Los contactos usan el mismo formato de teléfono y cédula. Dentro de la lista de cada usuario no se permiten teléfonos, correos o cédulas presentes duplicados; usuarios distintos pueden registrar el mismo teléfono o correo de contacto. La comparación detallada de correos de contacto permanece pendiente.
- Se usará JWT de acceso y token de renovación, con un registro por sesión en PostgreSQL para estado, expiración y revocación. Duraciones, formato y protección del token de renovación, rotación y revocación del acceso ya emitido siguen pendientes.
- Las marcas mínimas de eventos eliminados se conservan mientras el nodo pueda reenviar el evento; se eliminan únicamente cuando exista evidencia confiable de que el reenvío no podrá aceptarse. El ámbito, la prueba concreta y el tratamiento al eliminar la cuenta siguen pendientes.
- Las solicitudes de ubicación y sus respuestas son registros independientes y se conservan hasta que el usuario decida eliminarlas. El comportamiento de respuestas tardías y eliminación de cuenta sigue pendiente.

El [diagrama entidad-relación](diagrama-entidad-relacion.md) representa la propuesta de relaciones y atributos, no una migración implementada.

## Pendiente antes del esquema físico

Generación y ámbito de identificadores; validaciones de cuentas no acordadas y jurisdicciones de placa; alta y transferencia de propiedad; implementación de autenticación y correo; concurrencia y barrera de reasignación; contratos MQTT y SMS; datos mínimos, condición verificable de eliminación y privacidad de marcas de borrado; almacenamiento de imágenes; proveedores y reglas de reintentos; manejo de respuestas tardías y eliminación de solicitudes de ubicación. El esquema de PostgreSQL, migraciones y pruebas aún no existen.
