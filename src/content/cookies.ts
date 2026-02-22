/**
 * Política de Cookies RGPD-compliant. Ajustar tipos y duraciones según las cookies reales usadas.
 */
export const POLITICA_COOKIES_TITLE = 'Política de Cookies';

export const POLITICA_COOKIES_CONTENT = `
## 1. Qué son las cookies

Las cookies son pequeños archivos de texto que los sitios web y aplicaciones pueden almacenar en tu dispositivo (ordenador, tablet, móvil) para recordar preferencias, mantener la sesión o analizar el uso del servicio.

---

## 2. Cookies que utilizamos

A continuación se indican las cookies que Lexia puede utilizar, su finalidad y duración. Esta relación debe revisarse y actualizarse según los servicios realmente integrados (analíticas, preferencias, etc.).

| Nombre (ejemplo) | Finalidad | Duración | Tipo |
|------------------|-----------|----------|------|
| **lexia-theme** | Recordar preferencia de tema (claro/oscuro) | 1 año | Técnica / necesaria |
| **lexia_session** (si aplica) | Mantener la sesión del usuario | Sesión o según configuración | Técnica / necesaria |
| Cookies de analíticas (si se usan, p. ej. _ga, _gid) | Estadísticas de uso anónimas o pseudonimizadas | Según proveedor (ej. 2 años para Google Analytics) | Analítica |
| Cookies de terceros (p. ej. soporte en vivo) | Funcionalidades de terceros cuando se integren | Según proveedor | Según finalidad |

**Nota:** Si se incorporan cookies de analíticas o de terceros, esta tabla debe actualizarse y el banner de cookies debe ofrecer opciones granulares (aceptar solo necesarias, aceptar analíticas, etc.).

---

## 3. Finalidad de cada tipo

- **Técnicas / necesarias:** Esenciales para el funcionamiento de la aplicación (sesión, preferencias básicas). No requieren consentimiento según la normativa vigente, pero deben estar identificadas.
- **Analíticas:** Permiten medir el uso del servicio de forma agregada. Requieren consentimiento si no están anonimizadas o si se comparten con terceros.
- **De personalización:** Guardar preferencias del usuario (idioma, tema). Suelen requerir consentimiento si no son estrictamente necesarias.

---

## 4. Duración

- **Sesión:** Se eliminan al cerrar el navegador o la pestaña.
- **Persistentes:** Permanecen un tiempo determinado (días, meses o años) según la tabla anterior.

---

## 5. Cómo desactivarlas o gestionarlas

- **Desde el banner de cookies:** En la primera visita (o tras borrar cookies) se muestra un aviso con enlaces a esta política y opciones para aceptar solo las necesarias, aceptar todas o personalizar (cuando se ofrezca gestión granular).
- **Desde el navegador:** Puedes configurar tu navegador para bloquear o eliminar cookies. La forma de hacerlo depende del navegador (Chrome, Firefox, Safari, Edge, etc.). Ten en cuenta que desactivar cookies técnicas puede afectar al funcionamiento de Lexia (por ejemplo, no se guardará la preferencia de tema).
- **Enlaces de ayuda:**  
  - [Chrome](https://support.google.com/chrome/answer/95647)  
  - [Firefox](https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies)  
  - [Safari](https://support.apple.com/es-es/guide/safari/sfri11471/mac)  
  - [Edge](https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)

---

## 6. Consentimiento y banner RGPD

Al acceder por primera vez a Lexia se muestra un **banner de cookies** que:

- Informa de la existencia de cookies y enlaza a esta Política de Cookies.
- Ofrece la posibilidad de **aceptar solo las estrictamente necesarias** o **aceptar todas** (y, si está implementado, **configurar** con opciones granulares: necesarias, analíticas, etc.).
- No se instalan cookies no necesarias hasta que el usuario haya dado su consentimiento, salvo las estrictamente necesarias para el funcionamiento del servicio.

Puedes cambiar tu elección en cualquier momento desde el enlace “Cookies” en el pie de la aplicación o desde la configuración de tu navegador.
`;
