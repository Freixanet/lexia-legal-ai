# Optimización de rendimiento — Lexia

Lexia usa **Vite + React** (no Next.js). Este doc resume las optimizaciones aplicadas y los objetivos de Lighthouse.

## Objetivos (Lighthouse)

| Métrica | Objetivo |
|--------|----------|
| Performance | 95+ |
| First Contentful Paint (FCP) | < 1 s |
| Time to Interactive (TTI) | < 2 s |
| Largest Contentful Paint (LCP) | < 2.5 s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| First Input Delay (FID) | < 100 ms |

## Optimizaciones aplicadas

### 1. Carga diferida (lazy) y Suspense

- **Rutas**: `LandingPage`, `LandingV3`, `ChatInterface`, `LegalPage`, `LoginPage` se cargan con `React.lazy()`.
- **Modales**: `CommandPalette` y `KeyboardShortcutsCheatsheet` se cargan solo al abrirlos (Cmd+K, Cmd+?), reduciendo el JS inicial.
- **Suspense**: Cada ruta tiene un fallback con skeleton (landing, chat, legal, login) para feedback inmediato.

### 2. Loading y skeletons

- **`src/app/loading.tsx`**: Exporta `Loading`, `LoadingLanding`, `LoadingChat`, `LoadingLegal`, `LoadingLogin` para usar como fallback de Suspense.
- **Skeletons**: Definidos en `src/components/ui/Skeleton.tsx` (Landing, Chat, Legal, Login) con estilos en `Skeleton.css`.

### 3. Bundle (Vite)

- **manualChunks**: Separación de vendors (`vendor-react`, `vendor-motion`, `vendor-radix`, `vendor-markdown`, `vendor-storage`, `vendor-toast`, `vendor-icons`, `vendor-store`) para mejor caché y carga en paralelo.
- **CSS**: `cssCodeSplit: true` para que cada ruta cargue solo su CSS.
- **Minificación**: `esbuild`, sin sourcemaps en producción.

### 4. Caché

- **API**: Si tienes backend (p. ej. `/api/chat`), usa cabeceras `Cache-Control` adecuadas (respuestas estáticas o semi-estáticas con `stale-while-revalidate`).
- **Cliente**: Conversaciones y borradores usan IndexedDB (`idb-keyval`) y `localStorage`; no hay SWR/React Query en el flujo actual.

### 5. Streaming del chat

- El primer token del chat depende del backend; para objetivo &lt; 500 ms hay que optimizar el endpoint (streaming desde el primer byte, sin buffering grande).

### 6. Base de datos (backend)

- Índices en columnas usadas en filtros y búsquedas.
- Paginación por cursor en listas largas (p. ej. mensajes).
- Evitar `SELECT *`; seleccionar solo las columnas necesarias.

## Analizar el bundle

Para generar un reporte visual del bundle:

```bash
npm install -D rollup-plugin-visualizer
```

En `vite.config.ts` (solo en build de análisis):

```ts
import { visualizer } from 'rollup-plugin-visualizer'

// en plugins, condicional:
...(process.env.ANALYZE === 'true' ? [visualizer({ open: true, gzipSize: true })] : []),
```

Luego:

```bash
ANALYZE=true npm run build
```

## Prefetch de rutas (React Router)

React Router no tiene `prefetch` como Next.js. Para prefetch bajo demanda se puede:

- Usar `link rel="prefetch"` para la siguiente ruta probable.
- O cargar el chunk en `onMouseEnter` / `onFocus` del `Link` (preload del módulo con `import()`).
