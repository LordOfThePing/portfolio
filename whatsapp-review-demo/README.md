# App de demostración para la Revisión de App de Meta (WhatsApp Business)

Esta carpeta contiene una app local real que usa la WhatsApp Business Cloud API
para generar la evidencia en video que Meta pide al solicitar acceso avanzado a:

- whatsapp_business_messaging  (enviar mensajes a clientes)  -> Video 1
- whatsapp_business_management (gestionar plantillas y cuentas) -> Video 2

La app se compone de una interfaz web (lo que grabas) y un pequeño servidor local
que actúa como el backend: es quien llama a la API de Meta con tus credenciales.

------------------------------------------------------------
1. LÉELO PRIMERO (honestidad ante todo)
------------------------------------------------------------

- Los videos que subes a la Revisión de App deben mostrar operaciones REALES.
  No envíes videos simulados ni editados de forma engañosa: los revisores de
  Meta lo comprueban y puede costarte la aprobación o la cuenta.
- Esta app es real: con tus credenciales envía mensajes de WhatsApp y crea
  plantillas de mensaje a través de la WhatsApp Cloud API.
- Lo que esta app NO puede hacer por ti: la verificación de tu negocio, el
  opt-in de los destinatarios, la aprobación de tus plantillas ni la decisión
  final de Meta. La aprobación depende de tu caso de uso y de tu evidencia.

------------------------------------------------------------
2. Qué incluye
------------------------------------------------------------

    server.js            Servidor local sin dependencias (Node.js 18+).
                         Sirve la interfaz y hace de proxy a la API de Meta.
                         El access token NUNCA vive en el navegador.
    public/              Interfaz de la app (index.html, styles.css, app.js).
    data/                Se crea al ejecutar: config.json y log.jsonl.
                         Contenido sensible: no lo subas al repositorio.
    README.md            Este documento con los guiones de grabación.

------------------------------------------------------------
3. Requisitos previos (en tu cuenta de Meta)
------------------------------------------------------------

Necesitas una app creada en developers.facebook.com con el producto WhatsApp
agregado. Copia de ahí o de WhatsApp Manager estos datos:

1. Access Token
   - Rápido: token temporal de 24 horas (WhatsApp > Configuración de la API).
   - Mejor para el video: token de sistema permanente con los permisos
     whatsapp_business_messaging y whatsapp_business_management.
2. Phone Number ID (id del número de teléfono del negocio).
3. WhatsApp Business Account ID (WABA ID).
4. Un número de WhatsApp que RECIBA los mensajes (puede ser tu segundo número
   o el de un colaborador). Debe ser un usuario real de WhatsApp.
5. Si vas a enviar texto libre, el destinatario debe haberte escrito antes
   (ventana de servicio de 24 horas) u haber dado su consentimiento. Si vas a
   enviar una plantilla, esta debe estar aprobada por Meta.

Donde encontrarlo:
- developers.facebook.com > tu app > WhatsApp > Configuración de la API:
  ahí están el token temporal, el Phone number ID y el WABA ID.
- developers.facebook.com > tu app > Configuración > Permisos y funciones:
  ahí pides el acceso avanzado de los permisos (lo que estás revisando).

------------------------------------------------------------
4. Puesta en marcha
------------------------------------------------------------

Prerrequisito: Node.js 18 o superior.

    node -v

Ejecuta el servidor:

    cd whatsapp-review-demo
    node server.js

Abre la app en el navegador:

    http://127.0.0.1:8090

Para detener: Ctrl+C en la terminal.

Puerto alternativo (PowerShell):

    $env:PORT = 8091
    node server.js

Primer uso en la interfaz (sección 1):
1. Escribe el nombre visible de tu app (debe coincidir con el nombre de la
   app que está en revisión en Meta).
2. Modo: Producción (API real).
3. Pega el Access Token, el Phone Number ID y el WABA ID.
4. Pulsa "Guardar y probar conexión". Debe aparecer el número, el nombre
   verificado y la calidad (green pill "Conectado a WhatsApp Cloud API").

Hay un modo "Simulación" solo para ensayar la grabación sin conexión y sin
gastar mensajes. Para los videos finales usa Producción.

------------------------------------------------------------
5. Guion del Video 1 (whatsapp_business_messaging)
------------------------------------------------------------

Lo que pide Meta (texto del checklist):
"Graba un video que muestre un mensaje enviándose desde tu app a un número de
WhatsApp. El video debe mostrar tanto la app enviando el mensaje como la
interfaz de WhatsApp (web o móvil) recibiéndolo."

Preparación (5 minutos antes de grabar):
1. Con el número destino, abre WhatsApp Web o móvil y envía un mensaje al
   número de negocio, por ejemplo: "Hola, quiero recibir información". Eso
   abre la ventana de 24 horas y permite responder con texto libre.
2. Alternativa sin ventana: usa una plantilla aprobada (la creas en la
   sección 3 y esperas a que aparezca APPROVED).
3. Abre tu grabador de pantalla (OBS Studio, Xbox Game Bar, QuickTime,
   Loom...). Resolución mínima recomendada: 720p.

Secuencia a grabar (sin cortes entre pasos 2 y 4 si es posible):
1. Muestra la app abierta en Producción: píldora verde "Conectado a WhatsApp
   Cloud API" y el nombre de tu app en la cabecera.
2. En la sección "Enviar mensaje de WhatsApp" escribe el número destino (el
   que tiene WhatsApp abierto) y el mensaje de prueba. Pulsa "Enviar mensaje".
3. Deja visible la respuesta de la API: un id wamid.XXXX y la bitácora con
   HTTP 200 (sección 4).
4. Cambia a la ventana de WhatsApp Web (o al móvil) y muestra el mensaje
   recibido desde el número de negocio. Idealmente muestra ambas ventanas a
   la vez (pantalla dividida).

Qué valida Meta: el mensaje sale de TU app y llega a WhatsApp usando tus
credenciales. Por eso el video debe mostrar el lado emisor y el lado receptor.

------------------------------------------------------------
6. Guion del Video 2 (whatsapp_business_management)
------------------------------------------------------------

Lo que pide Meta (texto del checklist):
"Realiza llamadas de prueba a la API y graba un único video por separado que
muestre la creación de una plantilla de mensaje."

Secuencia a grabar:
1. Abre la app y entra a la sección "Plantillas de mensaje". Muestra el
   nombre de tu app en la cabecera.
2. Rellena el formulario de creación:
   - Nombre: en minúsculas y sin espacios (ej. confirmacion_cita_2025).
   - Idioma: por ejemplo es_MX.
   - Categoría: UTILITY (se aprueba más rápido que MARKETING).
   - Encabezado opcional y cuerpo de la plantilla (puedes usar variables
     {{1}} y {{2}}).
3. Pulsa "Crear plantilla". Deja visible la respuesta JSON de la API con el
   id de la plantilla y el estado PENDING.
4. Pulsa "Actualizar lista" y muestra la plantilla nueva en la tabla con su
   estado. Puedes cerrar el video aquí, o volver más tarde y mostrar que
   quedó APPROVED (en UTILITY suele tardar minutos u horas).
5. Opcional: muestra en la bitácora el POST /WABA_ID/message_templates con
   HTTP 200 para reforzar que fue una llamada real a la API.

Qué valida Meta: tu backend/app sabe llamar a la API de gestión de plantillas,
que es la base del permiso whatsapp_business_management.

------------------------------------------------------------
7. Consejos para que la revisión salga bien
------------------------------------------------------------

- Graba en mp4, 720p o más, con el nombre de la app visible y coincidente con
  la app en revisión.
- No muestres el Access Token en cámara. El campo es de tipo password; si ya
  guardaste la configuración, no necesitas volver a escribirlo para grabar.
- Si el envío de texto libre falla con el error 131026, es porque no hay
  ventana de 24 horas: pide al destinatario que escriba primero al número de
  negocio, o envía una plantilla aprobada.
- Si usas el número de prueba que Meta asigna al WABA, recuerda que solo
  puede mensajear a los números que registres como usuarios de prueba.
- Crea la plantilla del Video 2 con antelación suficiente si también la vas a
  usar en el Video 1: debe estar APPROVED antes de grabar el envío.

Errores comunes y qué significan:

    190       Token inválido o caducado: genera otro token.
    10        Sin permiso: revisa los permisos del token y de la app.
    100       Solicitud inválida: revisa el detalle que devuelve la API.
    131026    No hay ventana de servicio: el destino debe escribirte primero.
    132000    El destino no es un número de WhatsApp válido.
    131030    El número de negocio no está registrado en la Cloud API.

------------------------------------------------------------
8. Seguridad
------------------------------------------------------------

- La carpeta data/ está en .gitignore: nunca subas config.json ni log.jsonl
  a un repositorio (contienen tu token y actividad).
- El servidor escucha solo en 127.0.0.1. No lo expongas a Internet.
- Esta app es solo para generar tu evidencia local; no la uses como producto
  final sin endurecer el manejo del token (variables de entorno, secretos).

------------------------------------------------------------
9. Preguntas frecuentes
------------------------------------------------------------

P: ¿Por qué un servidor local y no una página 100 % estática?
R: La API Graph de Meta no acepta llamadas directas desde el navegador
   (CORS) y, además, el token no debe exponerse en el cliente. El servidor
   local hace de backend de tu app; la interfaz del navegador es lo que
   grabas en los videos.

P: ¿Esta app garantiza la aprobación?
R: No. La aprobación depende de Meta y de tu caso de uso, tu verificación de
   negocio y la evidencia que subas. Esta app te permite generar la evidencia
   real que piden de forma rápida y creíble.

P: ¿Puedo usar el modo Simulación para los videos?
R: Solo para ensayar. Los videos finales deben mostrar operaciones reales
   contra la API de Meta.

P: ¿Dónde queda registrada la actividad?
R: En la sección 4 de la interfaz (bitácora) y en data/log.jsonl.

P: ¿Puedo cambiar el puerto?
R: Sí, con la variable PORT. Ejemplo: $env:PORT = 8091 y luego node server.js.
