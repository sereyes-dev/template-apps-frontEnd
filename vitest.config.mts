// =============================================================================
// vitest.config.mts — Configuración de Vitest
// =============================================================================
//
// 📦 Versión: Vitest 4.x
// 🛠  Stack:  Next.js 16 · React 19 · TypeScript 5.7+ · Testing Library
//
// ¿Por qué Vitest sobre Jest?
//   - Vitest usa Vite internamente: el mismo pipeline de transformación
//     que el resto del proyecto (no hay discrepancias de comportamiento).
//   - Es 2-10x más rápido que Jest en proyectos modernos gracias al HMR
//     y la ejecución nativa de ESModules.
//   - API 100% compatible con Jest: migration path sin cambiar tests existentes.
//   - Soporte nativo para TypeScript sin configuración extra.
//   - Watch mode mucho más inteligente (solo re-ejecuta tests afectados).
//
// Plugins y herramientas habilitadas:
//   1. @vitejs/plugin-react      → transforma JSX/TSX con React 17+ transform
//   2. vite-tsconfig-paths       → resuelve path aliases de tsconfig (@/)
//   3. @vitest/ui                → interfaz visual interactiva de tests
//   4. MSW (Mock Service Worker) → intercepta fetch/HTTP al nivel de red
//   5. vitest-axe + axe-core     → tests de accesibilidad automáticos (WCAG)
//
// Archivos adicionales generados junto a este config:
//   src/tests/setup.ts       → setup global: jest-dom, MSW, vitest-axe
//   src/mocks/node.ts        → servidor MSW para interceptar fetch en Vitest
//   src/mocks/handlers.ts    → handlers de ejemplo (crear y expandir según el proyecto)
// =============================================================================

import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // @vitejs/plugin-react transforma JSX/TSX usando el nuevo JSX transform
    // de React 17+ (no requiere importar React en cada archivo).
    //
    // Alternativa: @vitejs/plugin-react-swc (usa SWC en vez de Babel, más rápido).
    // Usar SWC si el equipo nota lentitud en transformaciones.
    react(),

    // vite-tsconfig-paths resuelve los path aliases definidos en tsconfig.json.
    // Ejemplo: import { Button } from '@/components/Button'
    // Sin este plugin, Vitest no podría resolver paths como @/ o ~/
    tsconfigPaths()
  ],

  test: {
    // =========================================================================
    // ENTORNO DE EJECUCIÓN
    // =========================================================================

    // 'jsdom' simula un DOM de navegador en Node.js.
    // Necesario para testear componentes React que usan document, window, etc.
    //
    // Alternativas:
    //   'happy-dom': implementación más rápida y ligera de jsdom.
    //                Buena opción si los tests son lentos con jsdom.
    //                bun add -d happy-dom
    //
    //   'node':      para tests de lógica pura sin DOM (utilidades, API routes).
    //                Se puede especificar por archivo con:
    //                @vitest-environment node (comentario en el archivo de test)
    //
    //   'edge-runtime': para testear código que corre en Edge Runtime de Next.js.
    //                   bun add -d @edge-runtime/vm
    environment: 'jsdom',

    // =========================================================================
    // SETUP Y CONFIGURACIÓN GLOBAL
    // =========================================================================

    // Archivos ejecutados antes de cada suite de tests.
    // Se ejecutan en orden: primero setup.ts (matchers + MSW + axe),
    // asegurando que todo esté disponible antes del primer test.
    //
    // setup.ts centraliza la configuración de las tres herramientas:
    //   1. @testing-library/jest-dom  → matchers de DOM (toBeInTheDocument, etc.)
    //   2. MSW (msw/node)             → intercepta fetch/HTTP en Node.js
    //   3. vitest-axe                 → matchers de accesibilidad (toHaveNoViolations)
    //
    // Ver el archivo src/tests/setup.ts (generado junto a este config) para
    // la implementación completa con comentarios explicativos.
    setupFiles: ['./src/tests/setup.ts'],

    // Inyecta las APIs de Vitest (describe, it, expect, etc.) globalmente
    // sin necesidad de importarlas en cada archivo de test.
    //
    // true  = no hay que escribir: import { describe, it, expect } from 'vitest'
    // false = hay que importar explícitamente (más verboso pero más claro).
    //
    // Recomendación: true para proyectos que migran de Jest (API idéntica).
    //                false para nuevos proyectos que prefieren imports explícitos.
    globals: true,

    // =========================================================================
    // ARCHIVOS DE TEST
    // =========================================================================

    // Patrones para encontrar archivos de test.
    // Por defecto Vitest busca: *.{test,spec}.{js,jsx,ts,tsx} y archivos en __tests__
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}'
    ],

    // Archivos excluidos del test runner.
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/e2e/**', // Los tests E2E los maneja Playwright
      '**/playwright-report/**'
    ],

    // =========================================================================
    // COBERTURA DE CÓDIGO
    // =========================================================================

    coverage: {
      // 'v8' usa el coverage nativo de V8 (más rápido, sin instrumentación).
      // Alternativa: 'istanbul' (más maduro, más detallado, requiere bun add -d @vitest/coverage-istanbul).
      // Usar istanbul si se necesita cobertura de branches muy precisa.
      provider: 'v8',

      // Genera reportes en múltiples formatos:
      reporter: [
        'text', // Resumen en la terminal al correr los tests.
        'html', // Reporte visual navegable en coverage/index.html.
        'lcov', // Formato para integración con SonarQube, Codecov, etc.
        'json-summary' // JSON para badges de cobertura en el README.
      ],

      // Directorio donde se guarda el reporte de cobertura.
      reportsDirectory: './coverage',

      // Archivos incluidos en el reporte de cobertura.
      // Solo el código fuente, no tests ni configuraciones.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        'src/**/index.ts', // Re-exports generalmente no necesitan cobertura.
        'src/**/*.d.ts', // Archivos de tipos.
        'src/tests/**' // Setup y helpers de tests.
      ],

      // Umbrales mínimos de cobertura. Si no se alcanzan, el CI falla.
      // Ajusta según la madurez del proyecto y las expectativas del equipo.
      //
      // Valores recomendados:
      //   - Proyecto nuevo en desarrollo: empezar con 50-60% e ir subiendo.
      //   - Proyecto en producción: 70-80% es un buen objetivo.
      //   - Librerías o código crítico: 90%+.
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70
      }
    },

    // =========================================================================
    // RENDIMIENTO Y CONCURRENCIA
    // =========================================================================

    // Número de tests que se ejecutan en paralelo.
    // Por defecto Vitest usa todos los CPUs disponibles.
    // Reducir si los tests consumen mucha memoria o interfieren entre sí.
    // pool: 'forks',        // Alternativa más aislada pero más lenta.
    // poolOptions: { threads: { maxThreads: 4 } },

    // Timeout en milisegundos para cada test individual.
    // 5000ms (5s) es suficiente para la mayoría de tests unitarios.
    // Aumentar si hay tests de integración con I/O.
    testTimeout: 5000,

    // Timeout para hooks (beforeAll, afterAll, beforeEach, afterEach).
    hookTimeout: 10000,

    // =========================================================================
    // MODO WATCH (desarrollo local)
    // =========================================================================

    // Estas opciones afectan el comportamiento del modo watch (bun test --watch).

    // Reportero visual durante el desarrollo.
    // 'verbose' muestra cada test individualmente.
    // 'dot'     muestra un punto por test (más compacto para proyectos grandes).
    // 'default' muestra un resumen (recomendado para la mayoría de casos).
    //
    // Se puede cambiar desde la terminal: bunx vitest --reporter=verbose
    reporters: process.env.CI ? ['verbose', 'github-actions'] : ['verbose'],

    // =========================================================================
    // INTERFAZ VISUAL — @vitest/ui
    // =========================================================================
    //
    // @vitest/ui levanta un servidor local con una interfaz visual en el
    // navegador que permite:
    //   - Ver el árbol completo de tests (suites, describe, it) con su estado
    //   - Filtrar y re-ejecutar tests individuales o suites completas
    //   - Ver el código fuente de cada test junto a su resultado
    //   - Ver el grafo de dependencias entre módulos
    //   - Explorar el reporte de cobertura de forma visual e interactiva
    //   - Ver snapshots y compararlos con la versión anterior
    //
    // Cuándo usar la UI vs el terminal:
    //   Terminal (default): integración continua (CI), pre-commit hooks.
    //   UI: desarrollo local cuando se trabaja en tests nuevos o se
    //       debuggea un test fallido que necesita más contexto visual.
    //
    // La UI se activa solo cuando se pasa el flag --ui:
    //   bunx vitest --ui              → abre en http://localhost:51204
    //   bunx vitest --ui --coverage   → con reporte de cobertura visual
    //
    // En modo CI (process.env.CI = true), la UI nunca se levanta aunque
    // ui: true esté configurado, porque detecta el entorno sin terminal.
    //
    // Alternativa: open: false para que no abra el browser automáticamente.
    //   ui: true,
    //   open: false,    // La URL sigue disponible pero no se abre el browser.
    ui: process.env.CI ? false : true,

    // open: abre automáticamente el browser al levantar la UI.
    // Solo aplica cuando ui: true. En CI siempre queda en false.
    open: process.env.CI ? false : true
  }
});

// =============================================================================
// 🔧 OPCIONES ADICIONALES NO INCLUIDAS (pero útiles según el caso):
//
// Storybook + @storybook/test
//   Permite correr los tests de Storybook stories directamente desde Vitest.
//   Ideal si el proyecto tiene un Design System con componentes en Storybook.
//   Los stories se convierten en tests automáticamente sin escribir código extra.
//   bun add -d @storybook/test @storybook/addon-vitest
//
// @vitest/snapshot (avanzado)
//   Extiende el sistema de snapshots de Vitest con snapshots inline, serializadores
//   personalizados y comparación de snapshots por bloques.
//   Útil para Design Systems donde se quiere controlar exactamente el HTML generado.
//   bun add -d @vitest/snapshot
//
// happy-dom (alternativa a jsdom)
//   Implementación más rápida y ligera de jsdom para el entorno de tests.
//   Buena opción si el suite de tests es lento con jsdom.
//   ⚠️  Incompatible con vitest-axe (bug conocido en happy-dom con axe-core).
//      Si se usa vitest-axe, quedarse con jsdom.
//   bun add -d happy-dom
//   En vitest.config.mts: environment: 'happy-dom'
//
// @edge-runtime/vm (Edge Runtime de Next.js)
//   Para testear middleware, route handlers o código que corre en el Edge Runtime.
//   bun add -d @edge-runtime/vm
//   En cada archivo de test: @vitest-environment edge-runtime (comentario)
// =============================================================================

// =============================================================================
// 📦 COMANDO DE INSTALACIÓN DE TODOS LOS PLUGINS
//
// Copia y pega este comando para instalar todas las dependencias de una vez:
//
// bun add -d vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom vite-tsconfig-paths @vitest/coverage-v8 @vitest/ui msw vitest-axe axe-core
//
// =============================================================================
