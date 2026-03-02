// =============================================================================
// src/mocks/node.ts — Servidor MSW para entorno Node.js (Vitest)
// =============================================================================
//
// Este archivo configura MSW para el entorno de tests (Node.js / Vitest).
// Es diferente del setup de MSW para el browser (msw/browser en main.tsx).
//
// ¿Por qué dos archivos distintos para Node y Browser?
//   En el browser, MSW usa un Service Worker para interceptar requests.
//   En Node.js (Vitest), MSW parchea los módulos http/https nativos.
//   Mismos handlers, distinto mecanismo de interceptación.
//
//   Flujo recomendado:
//     src/mocks/handlers.ts  → handlers compartidos (Node + Browser)
//     src/mocks/node.ts      → este archivo, solo para tests (Vitest)
//     src/mocks/browser.ts   → para desarrollo local en el browser
//
// El objeto `server` exportado aquí es importado por src/tests/setup.ts,
// que llama a server.listen(), server.resetHandlers() y server.close()
// en los hooks de Vitest (beforeAll, afterEach, afterAll).

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// setupServer recibe los handlers y devuelve un objeto `server` que controla
// la interceptación de requests en Node.js. Los handlers se aplican a todos
// los tests que corren después de server.listen() en setup.ts.
export const server = setupServer(...handlers);
