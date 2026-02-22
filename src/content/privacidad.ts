/**
 * Política de Privacidad RGPD. Sustituir placeholders por los datos reales de la empresa y DPO.
 */
export const POLITICA_PRIVACIDAD_TITLE = 'Política de Privacidad';

export const POLITICA_PRIVACIDAD_CONTENT = `
## 1. Responsable del tratamiento

**Responsable:** [NOMBRE DE LA EMPRESA]  
**CIF/NIF:** [CIF]  
**Domicilio:** [DIRECCIÓN]  
**Contacto:** [EMAIL]

---

## 2. Delegado de Protección de Datos (DPO)

Si aplica en su organización, puede contactar al DPO en: **[EMAIL DPO]** para cualquier cuestión relativa a la protección de datos y ejercicio de derechos.

---

## 3. Datos que recogemos y finalidad (base legal)

| Datos | Finalidad | Base legal |
|-------|-----------|------------|
| Correo electrónico / cuenta (si hay registro) | Gestión de la cuenta y del servicio | Ejecución del contrato / consentimiento |
| Contenido de las conversaciones (mensajes y respuestas) | Prestación del servicio de orientación legal mediante IA | Ejecución del contrato |
| Documentos subidos (PDF, imágenes) | Análisis para responder a consultas | Consentimiento / ejecución del contrato |
| Datos técnicos (IP, tipo de dispositivo, uso de la app) | Seguridad, mejora del servicio, análisis agregado | Interés legítimo |
| Preferencias (tema claro/oscuro, idioma) | Mejorar la experiencia de uso | Consentimiento / interés legítimo |

---

## 4. Cómo se procesan los documentos subidos

Los documentos que adjuntas (PDF, imágenes) se envían a los sistemas de procesamiento de texto e IA necesarios para generar respuestas. Se utilizan únicamente en el contexto de tu conversación y, según la configuración del servicio, pueden ser procesados por proveedores de IA (véase apartado de cesiones y transferencias).

---

## 5. Cesión de datos a terceros

Para el funcionamiento de Lexia utilizamos los siguientes proveedores, que pueden tratar datos en nuestro nombre o como encargados del tratamiento:

- **Supabase:** alojamiento de base de datos y autenticación (cuando aplique). Los datos pueden estar almacenados en la UE según la región configurada.
- **Proveedores de IA (p. ej. OpenAI, Anthropic):** el contenido de las conversaciones y, en su caso, los documentos subidos se envían a estos servicios para generar respuestas.

**Transferencias internacionales:** Algunos de estos proveedores (como OpenAI y Anthropic) pueden procesar datos fuera del Espacio Económico Europeo (EEE). En esos casos, aplicamos las garantías previstas en el RGPD:
- Cláusulas contractuales tipo aprobadas por la Comisión Europea, y/o
- Decisiones de adecuación cuando existan, y/o
- Otras medidas adecuadas conforme al art. 46 RGPD.

Puedes solicitar más información sobre las garantías aplicables contactando a [EMAIL] o al DPO.

---

## 6. Periodo de retención

- **Conversaciones y mensajes:** Se conservan durante el tiempo necesario para prestar el servicio y, en su caso, según lo que indiques en la aplicación (por ejemplo, hasta que borres la conversación o cierres la cuenta). En todo caso, no más allá de lo estrictamente necesario o del plazo legal aplicable.
- **Datos de cuenta:** Mientras mantengas la cuenta activa y, tras la baja, durante los plazos legales de prescripción o reclamación.
- **Datos técnicos y logs:** El tiempo necesario para seguridad y resolución de incidencias, dentro de los límites legales.

---

## 7. Derechos ARCO-POL (Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Olvido, Limitación)

Tienes derecho a:

- **Acceso:** Saber qué datos tratamos sobre ti.
- **Rectificación:** Corregir datos inexactos o incompletos.
- **Supresión / “Derecho al olvido”:** Solicitar la eliminación de tus datos cuando la ley lo permita.
- **Oposición:** Oponerte a determinados tratamientos en los casos previstos.
- **Portabilidad:** Recibir tus datos en formato estructurado y de uso común.
- **Limitación:** Solicitar la limitación del tratamiento en los supuestos legalmente previstos.
- **Retirar el consentimiento** cuando el tratamiento se base en el consentimiento, sin que ello afecte a la licitud del tratamiento anterior.

Para ejercer estos derechos, escribe a [EMAIL] o al DPO indicando tu identidad y el derecho que deseas ejercer. También puedes presentar una reclamación ante la **Agencia Española de Protección de Datos** (www.aepd.es).

---

## 8. Cómo ejercer tus derechos

Envía un correo a **[EMAIL]** (o al DPO si aplica) indicando:
- Nombre, apellidos y, si es posible, correo asociado a la cuenta.
- Derecho que deseas ejercer (acceso, rectificación, supresión, etc.).
- En su caso, datos o hechos que justifiquen tu petición.

Responderemos en el plazo legal (normalmente un mes, prorrogable dos meses si es necesario).

**Derecho de supresión desde la app:** Puedes eliminar todos tus datos almacenados en este dispositivo (conversaciones, preferencias, consentimiento de cookies) en cualquier momento desde **Configuración > Eliminar todos mis datos**. La eliminación es inmediata y no se puede deshacer.

---

## 9. Medidas de seguridad

Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos (acceso restringido, cifrado en tránsito —HTTPS/TLS— y, cuando proceda, en reposo; revisiones de acceso; formación del personal).

**Notificación de brechas:** En caso de brecha de seguridad que implique riesgo para los derechos de las personas, te informaremos sin dilación indebida y, cuando proceda, notificaremos a la **Agencia Española de Protección de Datos (AEPD)** en un plazo máximo de **72 horas** desde que tengamos constancia de la brecha, conforme al art. 33 RGPD.

---

## 10. Uso de cookies

El uso de cookies y tecnologías similares se describe en nuestra **Política de Cookies**, accesible desde el pie de la aplicación.

---

## 11. Transferencias internacionales de datos

Como se indica en el apartado 5, algunos proveedores (p. ej. servicios de IA) pueden estar ubicados fuera del EEE. En esos casos garantizamos un nivel de protección adecuado mediante cláusulas contractuales tipo u otras medidas aprobadas conforme al RGPD. Puedes solicitar una copia de las garantías aplicables en [EMAIL].

---

## 12. Registro de actividades de tratamiento

Mantenemos un **registro de las actividades de tratamiento** conforme al art. 30 RGPD, en el que se describen los procesos de datos, finalidades, destinatarios y medidas de seguridad. Puedes solicitar información sobre el mismo dirigiendo un correo a **[EMAIL]** o al DPO.
`;
