# Checklist de Seguridad — Lexia

Estado actual del proyecto respecto a las prácticas de seguridad recomendadas.

---

## AUTENTICACIÓN

| Item | Estado | Notas |
|------|--------|--------|
| Contraseñas hasheadas (bcrypt) | ⬜ Pendiente | Cuando se integre Supabase Auth, Supabase hashea con bcrypt por defecto. |
| Rate limiting en login (max 5 intentos/5 min) | ⬜ Pendiente | Añadir en el endpoint de login cuando exista (Supabase Auth o API propia). |
| JWT con expiración corta (1h) + refresh tokens | ⬜ Pendiente | Actualmente el front usa `localStorage` (lexia-logged-in). Migrar a Supabase Auth dará JWT + refresh. |
| CSRF protection | ⬜ Pendiente | En APIs con cookies de sesión, usar tokens CSRF. Supabase Auth maneja sesión por token. |
| Logout invalida el token | ⬜ Pendiente | Con Supabase: `signOut()` invalida sesión. Hoy solo se borra `localStorage`. |

---

## AUTORIZACIÓN

| Item | Estado | Notas |
|------|--------|--------|
| RLS en Supabase: usuarios solo ven sus datos | ⬜ Pendiente | Definir políticas RLS en tablas (conversations, documents) por `auth.uid()`. |
| API routes validan sesión en cada request | ⬠ Parcial | `api/documents/upload.ts` exige `X-User-Id` o `Authorization`. Chat (`api/chat.ts`) no valida usuario (sin BD por usuario). |
| No IDOR (no acceder a chats de otros por ID) | ⬠ Parcial | Datos de chat en cliente (IndexedDB); al pasar a Supabase, validar en backend que el conversationId pertenezca al usuario. |

---

## INPUT VALIDATION

| Item | Estado | Notas |
|------|--------|--------|
| Validación con Zod en cada input (front + backend) | ⬠ Parcial | Front: `src/lib/validators/schemas.ts`. Backend: chat valida tipo/longitud a mano; documents valida tipo/tamaño/magic bytes. |
| Sanitización HTML/XSS | ⬠ Parcial | Respuestas de IA se muestran con React (escape por defecto). Markdown con react-markdown. Evitar `dangerouslySetInnerHTML` con input usuario. |
| SQL injection prevention | ✅ OK | Supabase usa queries parameterizadas. No concatenar SQL con input. |
| File upload: tipo, tamaño, contenido | ✅ OK | `api/documents/upload.ts`: MIME permitidos, `MAX_DOCUMENT_SIZE_BYTES`, magic bytes. |

---

## DATOS

| Item | Estado | Notas |
|------|--------|--------|
| HTTPS everywhere | ✅ OK | Vercel sirve HTTPS. |
| Datos sensibles cifrados en reposo | ⬜ Pendiente | Supabase cifra BD; revisar si hay campos extra sensibles y cifrado aplicado. |
| No exponer `service_role_key` en frontend | ✅ OK | Solo se usa en `api/documents/upload.ts` (server-side). |
| Variables de entorno para todas las claves | ✅ OK | `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `KV_*` en env. |
| No logging de datos personales | ⬠ Revisar | Evitar `console.log` de body completo o PII en producción. |
| Headers de seguridad (CSP, HSTS, X-Frame-Options) | ✅ OK | Configurados en `vercel.json` (ver abajo). |

---

## API

| Item | Estado | Notas |
|------|--------|--------|
| Rate limiting por IP y por usuario | ⬠ Parcial | `api/chat.ts`: rate limit por IP (Vercel KV). Login: pendiente cuando exista. |
| Input size limits | ✅ OK | Chat: `MAX_MESSAGE_LENGTH = 10000`. Documents: `MAX_DOCUMENT_SIZE_BYTES`. |
| Timeout en requests a APIs externas | ⬠ Parcial | El cliente puede abortar con `AbortController`; el servidor propaga cierre. Timeout explícito a Gemini opcional. |
| No exponer stack traces en producción | ✅ OK | `api/chat.ts` devuelve "Internal server error". Documentos: mensaje genérico en prod (ver código). |

---

## INFRAESTRUCTURA

| Item | Estado | Notas |
|------|--------|--------|
| Cloudflare WAF | ⬜ Opcional | Configurar en Cloudflare si el tráfico pasa por su proxy. |
| DDoS protection | ⬜ Opcional | Vercel y Cloudflare mitigan; valorar límites adicionales. |
| Backups automáticos de BD | ✅ OK | Supabase incluye backups. |
| Monitoring de uptime | ⬜ Opcional | Vercel Analytics; integrar alertas si se requiere. |

---

## Acciones realizadas en código

- **vercel.json**: headers `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` (HSTS), y `Content-Security-Policy` base.
- **api/documents/upload.ts**: en producción no se devuelve el mensaje de error interno al cliente.
- **api/chat.ts**: ya no devuelve detalles de error interno; validación de longitud de mensajes y rate limit por IP.

---

## Próximos pasos recomendados

1. Integrar **Supabase Auth** (login/registro) y sustituir el flag `lexia-logged-in` por sesión JWT.
2. Definir **RLS** en todas las tablas de Supabase por `auth.uid()`.
3. Añadir **rate limiting en el endpoint de login** (p. ej. 5 intentos / 5 min por IP).
4. Validar en backend con **Zod** el body de `api/chat.ts` reutilizando o creando schemas compartidos.
5. Revisar **CSP** según fuentes (Gemini, fonts, analytics) y ajustar `vercel.json` si hace falta.
