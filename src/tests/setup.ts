// =============================================================================
// src/tests/setup.ts — Setup global de Vitest
// =============================================================================
//
// Este archivo se ejecuta UNA VEZ antes de cada suite de tests.
// Está referenciado en vitest.config.mts → test.setupFiles.
//
// Qué configura este archivo:
//   1. @testing-library/jest-dom  → matchers de DOM para Vitest
//   2. MSW (msw/node)             → intercepta fetch/HTTP en Node.js
//   3. vitest-axe                 → matchers de accesibilidad (WCAG)
//   4. Mocks globales del browser → matchMedia, ResizeObserver, etc.
//   5. Cleanup automático         → limpia el DOM entre tests
// =============================================================================

// =============================================================================
// 1. @testing-library/jest-dom — MATCHERS DE DOM
// =============================================================================
//
// Agrega matchers especializados para el DOM al objeto `expect` de Vitest.
//
// Matchers disponibles después de esta importación:
//   expect(el).toBeInTheDocument()       → el elemento existe en el DOM
//   expect(el).toBeVisible()             → el elemento es visible
//   expect(el).toBeDisabled()            → el elemento está deshabilitado
//   expect(el).toHaveValue('texto')      → el input tiene ese valor
//   expect(el).toHaveClass('active')     → el elemento tiene esa clase
//   expect(el).toHaveTextContent('...')  → el elemento contiene ese texto
//   expect(el).toHaveFocus()             → el elemento tiene el foco
//   expect(el).toHaveAttribute('href')   → el elemento tiene ese atributo
//   expect(el).toHaveStyle('color: red') → el elemento tiene ese estilo
//   expect(el).toBeChecked()             → el checkbox/radio está marcado
//   expect(el).toBeRequired()            → el input es requerido

import '@testing-library/jest-dom';

// =============================================================================
// 2. MSW — MOCK SERVICE WORKER (interceptación de red)
// =============================================================================
//
// MSW intercepta fetch, axios y cualquier HTTP request al nivel de red,
// sin modificar el código de la aplicación ni usar vi.mock().
//
// ¿Por qué MSW en lugar de vi.mock(fetch)?
//   vi.mock(fetch) mockea la FUNCIÓN, no la RED. Si el código usa otra
//   librería (ky, ofetch, got), el mock no aplica. MSW intercepta a nivel
//   de Node.js http/https, por lo que funciona con cualquier cliente HTTP.
//
//   Ventaja adicional: los mismos handlers reutilizables en:
//     - Tests de Vitest (este setup, con msw/node)
//     - Desarrollo local en el browser (msw/browser en main.tsx)
//
// Lifecycle:
//   beforeAll  → server.listen()         → activa la interceptación
//   afterEach  → server.resetHandlers()  → limpia handlers de tests individuales
//   afterAll   → server.close()          → desactiva la interceptación
//
// onUnhandledRequest: 'error':
//   Si un test hace una request sin handler definido en MSW, el test falla.
//   Evita requests reales accidentales a APIs externas.
//   Alternativa: 'warn' (avisa pero no falla) o 'bypass' (no recomendado).

import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '../mocks/node';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error'
  })
);

afterEach(() =>
  // Elimina handlers agregados por tests individuales con server.use().
  // Evita que un handler de un test afecte a los siguientes.
  server.resetHandlers()
);

afterAll(() => server.close());

// =============================================================================
// 3. vitest-axe — TESTS DE ACCESIBILIDAD (WCAG)
// =============================================================================
//
// Extiende `expect` con matchers de axe-core para detectar violaciones WCAG.
//
// Matcher disponible:
//   expect(await axe(container)).toHaveNoViolations()
//
// axe-core evalúa el HTML renderizado contra ~100 reglas WCAG 2.1/2.2:
//   - Imágenes sin alt text           - Formularios sin labels
//   - Contraste de color insuficiente - Heading hierarchy incorrecta
//   - Elementos interactivos sin nombre accesible
//
// ⚠️  No funciona con happy-dom (bug conocido). Requiere jsdom.
//
// Uso en los tests:
//   import { axe } from 'vitest-axe'
//
//   it('should have no a11y violations', async () => {
//     const { container } = render(<MyComponent />)
//     expect(await axe(container)).toHaveNoViolations()
//   })
//
// Para personalizar reglas (deshabilitar, filtrar por impacto):
//   import { configureAxe, axe } from 'vitest-axe'
//   const customAxe = configureAxe({
//     rules: [{ id: 'color-contrast', enabled: false }],
//   })

import 'vitest-axe/extend-expect';

// =============================================================================
// 4. CLEANUP AUTOMÁTICO — Testing Library
// =============================================================================
//
// Desmonta los componentes React renderizados después de cada test.
// Sin esto, el DOM de un test anterior puede interferir con el siguiente.

import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// =============================================================================
// 5. MOCKS GLOBALES DEL BROWSER
// =============================================================================
//
// jsdom simula el DOM pero no implementa todas las APIs del browser.
// Estos mocks evitan errores de "X is not a function" en tests de componentes.

// matchMedia: usado por hooks de media queries y librerías responsive.
// Sin este mock, useMediaQuery y react-responsive fallan en tests.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
});

// ResizeObserver: usado por librerías de charts, virtualized lists y tooltips.
// Radix UI, Recharts y react-virtual lo requieren.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver: usado para lazy loading, infinite scroll y animaciones
// on-scroll. react-intersection-observer lo requiere.
global.IntersectionObserver = class IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// scrollTo: usado por componentes con scroll programático.
window.scrollTo = () => {};

// URL.createObjectURL / revokeObjectURL: usado por componentes de upload
// que generan preview URLs de archivos. jsdom no los implementa.
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', {
    writable: true,
    value: (blob: Blob) => `blob:mock-url/${blob.size}`
  });
}

if (typeof window.URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    writable: true,
    value: () => {}
  });
}
