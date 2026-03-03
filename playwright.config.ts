// =============================================================================
// playwright.config.ts — Configuración de Playwright (E2E)
// =============================================================================
//
// 📦 Versión: Playwright 1.52+
// 🛠  Stack:  Next.js 16 · TypeScript 5.7+ · Bun
//
// ¿Por qué Playwright sobre Cypress?
//   - Playwright soporta múltiples navegadores (Chromium, Firefox, WebKit/Safari)
//     con una sola API. Cypress requiere plugins de terceros para Firefox/Safari.
//   - Playwright corre tests en paralelo de forma nativa y más eficiente.
//   - Playwright es la opción recomendada oficialmente por el equipo de Next.js.
//   - Auto-wait integrado: espera automáticamente a que los elementos estén
//     disponibles, sin necesidad de sleeps ni waits manuales.
//   - Soporte nativo para pruebas de accesibilidad, redes, storage states, etc.
//
// Funcionalidades habilitadas en este config:
//   1. @axe-core/playwright  → tests de accesibilidad WCAG automáticos en E2E
//   2. Regresión visual      → toHaveScreenshot() nativo con Pixelmatch, sin deps extra
//   3. Storage State         → autenticación persistente entre tests (project deps)
//
// 📦 COMANDO DE INSTALACIÓN:
//   bun add -d @playwright/test @axe-core/playwright
//   bunx playwright install              (instala los navegadores)
//   bunx playwright install --with-deps  (en CI/Linux, dependencias del SO)
//
// Archivos auxiliares generados junto a este config:
//   e2e/fixtures/axe.fixture.ts        → fixture reutilizable de @axe-core/playwright
//   e2e/auth/global.setup.ts           → setup de autenticación con storageState
//   playwright/.auth/                  → carpeta de sesiones (en .gitignore)
// =============================================================================

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Rutas de los archivos de autenticación (Storage State).
// Un archivo por rol de usuario — ampliar según los roles de la app.
// ⚠️  Estos archivos NUNCA deben commitearse. Agregar a .gitignore:
//     playwright/.auth/
export const STORAGE_STATE = {
  user: path.join(__dirname, 'playwright/.auth/user.json'),
  admin: path.join(__dirname, 'playwright/.auth/admin.json')
};

// Lee la URL base del entorno o usa localhost por defecto.
// En CI se puede sobreescribir con: BASE_URL=https://staging.app.com bun test:e2e
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

// Detecta si estamos en un entorno de CI (GitHub Actions, Vercel, etc.)
const isCI = !!process.env.CI;

export default defineConfig({
  // ===========================================================================
  // ARCHIVOS DE TEST
  // ===========================================================================

  // Directorio donde Playwright busca los tests E2E.
  // Se separa de los tests unitarios (src/) para claridad arquitectural.
  testDir: './e2e',

  // Patrón de archivos de test E2E.
  // Alternativa: '**/*.e2e.ts' si prefieres el sufijo .e2e en vez de .spec.
  testMatch: '**/*.spec.ts',

  // ===========================================================================
  // COMPORTAMIENTO GENERAL
  // ===========================================================================

  // Tiempo máximo para que un test completo pase (incluyendo todos los steps).
  // 30s es suficiente para la mayoría de flujos de usuario.
  // Aumentar si el app es lenta en CI o si hay tests de carga.
  timeout: 30 * 1000,

  // Tiempo máximo para que una sola aserción (expect) pase.
  // Playwright reintenta automáticamente las aserciones hasta este límite.
  // Esto evita la necesidad de sleeps y waitFor manuales.
  expect: {
    timeout: 5000,

    // =========================================================================
    // REGRESIÓN VISUAL — toHaveScreenshot (nativo, sin dependencias extra)
    // =========================================================================
    //
    // Playwright tiene soporte nativo de visual regression testing mediante
    // toHaveScreenshot(). Usa Pixelmatch internamente para comparar imágenes
    // pixel a pixel. No requiere instalar ninguna librería adicional.
    //
    // Cómo funciona:
    //   1. Primera ejecución: el test FALLA y genera la imagen de referencia (baseline).
    //      Revisar la imagen generada y commitearla si es correcta.
    //   2. Ejecuciones siguientes: compara el screenshot actual contra el baseline.
    //      Si supera el threshold, el test falla y genera tres imágenes:
    //        expected.png → baseline de referencia
    //        actual.png   → screenshot del run actual
    //        diff.png     → píxeles diferentes resaltados en magenta
    //
    // Dónde se guardan los baselines:
    //   Por defecto en __screenshots__/ junto a cada archivo de test.
    //   El directorio se puede cambiar con snapshotDir en cada proyecto.
    //   ✅ Los baselines SÍ deben commitearse (son artefactos de test).
    //
    // Comandos útiles:
    //   bunx playwright test --update-snapshots   → regenera todos los baselines
    //   bunx playwright test --update-snapshots --grep "visual"  → solo tests visuales
    //
    // Problema habitual: diferencias entre OS/CI
    //   Las fuentes y el anti-aliasing varían entre macOS, Linux y Windows.
    //   Solución: generar los baselines en el mismo entorno que CI (Docker/Linux).
    //   En equipos mixtos: usar una imagen Docker consistente para todos.
    toHaveScreenshot: {
      // threshold: tolerancia de diferencia de color percibida (0=estricto, 1=permisivo).
      // 0.2 es el valor por defecto. Para proyectos con muchos gradientes o animaciones
      // sutiles, subir a 0.3. Para Design Systems con pixel precision, bajar a 0.1.
      threshold: 0.2,

      // maxDiffPixelRatio: porcentaje máximo de píxeles diferentes permitidos (0-1).
      // 0.01 = máximo 1% de píxeles distintos. Más estricto que maxDiffPixels
      // porque es relativo al tamaño de la imagen (funciona igual en mobile y desktop).
      //
      // Alternativa: maxDiffPixels (número absoluto de píxeles).
      // Usar maxDiffPixelRatio para páginas con viewports variables.
      maxDiffPixelRatio: 0.01,

      // animations: deshabilita las animaciones CSS/JS durante la captura.
      // 'disabled' congela las animaciones en su estado inicial.
      // Sin esto, una animación a mitad de ejecución causaría fallos espurios.
      animations: 'disabled',

      // scale: 'css' usa las dimensiones CSS del elemento (independiente del DPR).
      // Alternativa: 'device' usa la resolución nativa del device (más píxeles, más lento).
      scale: 'css'

      // stylePath: inyecta un CSS personalizado durante los screenshots.
      // Útil para ocultar elementos dinámicos globalmente (timestamps, avatars, ads).
      // Ver e2e/fixtures/screenshot.css para el ejemplo de implementación.
      // stylePath: path.join(__dirname, 'e2e/fixtures/screenshot.css'),
    }
  },

  // Número de reintentos en caso de fallo.
  // 0 en desarrollo (queremos ver el fallo inmediatamente).
  // 2 en CI para manejar flakiness de red o timing.
  retries: isCI ? 2 : 0,

  // Número de workers (tests en paralelo).
  // En desarrollo: la mitad de los CPUs (no saturar la máquina).
  // En CI: '50%' o un número fijo según los recursos del runner.
  workers: isCI ? '50%' : undefined,

  // Falla el suite completo al primer test fallido en CI.
  // Ahorra tiempo en CI cuando hay un fallo crítico.
  // En desarrollo: false para ver todos los fallos.
  forbidOnly: isCI,

  // ===========================================================================
  // REPORTES
  // ===========================================================================

  reporter: [
    // 'list' muestra cada test en tiempo real en la terminal.
    // Alternativa: 'dot' (más compacto), 'line' (una línea por archivo).
    ['list'],

    // 'html' genera un reporte visual navegable en playwright-report/.
    // Muy útil para revisar fallos con screenshots y videos en CI.
    // open: 'on-failure' abre el reporte automáticamente solo si hay fallos.
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: isCI ? 'never' : 'on-failure'
      }
    ],

    // 'github' formatea los errores para que GitHub Actions los muestre
    // directamente en el diff de los PRs.
    ...(isCI ? [['github'] as const] : []),

    // ⚠️  DESCOMENTA para generar reporte JUnit (Jenkins, SonarQube):
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // Directorio donde se guardan los artefactos (screenshots, videos, traces).
  outputDir: 'test-results',

  // ===========================================================================
  // CONFIGURACIÓN GLOBAL DE TODOS LOS TESTS
  // ===========================================================================

  use: {
    // URL base para todas las navegaciones.
    // Permite usar: await page.goto('/login') en vez de la URL completa.
    baseURL: BASE_URL,

    // Rastrea acciones del test para debugging.
    // 'on-first-retry': solo guarda el trace si el test falla y se reintenta.
    //                   Equilibrio entre espacio en disco y utilidad de debugging.
    //
    // Alternativas:
    //   'on'             = siempre guardar trace (usa mucho espacio).
    //   'off'            = nunca guardar trace (no hay info de debugging).
    //   'retain-on-failure' = guarda solo tests fallidos (buena opción para CI).
    trace: 'on-first-retry',

    // Capturas de pantalla automáticas en caso de fallo.
    // 'only-on-failure' es el balance ideal: no satura el disco pero provee contexto.
    //
    // Alternativa: 'on' para siempre capturar (útil en tests de regresión visual).
    screenshot: 'only-on-failure',

    // Video de la ejecución del test.
    // 'on-first-retry' evita generar videos en cada run, solo cuando hay problemas.
    //
    // Alternativa: 'retain-on-failure' para guardar videos de todos los tests fallidos.
    video: 'on-first-retry',

    // Idioma del navegador (afecta formatos de fecha, número, etc.).
    // Ajusta al locale de tu aplicación para evitar fallos en tests de internacionalización.
    locale: 'es-CO',

    // Zona horaria del navegador en los tests.
    // Importante para tests que muestran fechas/horas.
    timezoneId: 'America/Bogota',

    // Viewport del navegador.
    // Ajusta al viewport más común de tu audiencia objetivo.
    viewport: { width: 1280, height: 720 }

    // Comportamiento de los clicks: 'real' usa eventos de ratón más realistas.
    // Alternativa: 'default' para mayor velocidad.
    // actionTimeout: 10000,   // Timeout para acciones individuales (click, fill, etc.)
    // navigationTimeout: 15000, // Timeout para navegaciones de página.
  },

  // ===========================================================================
  // PROYECTOS (navegadores y dispositivos)
  // ===========================================================================

  projects: [
    // =========================================================================
    // PROYECTO DE SETUP — Storage State (autenticación)
    // =========================================================================
    //
    // Este proyecto especial corre ANTES que todos los demás.
    // Su única función es hacer login y guardar las cookies y localStorage
    // en archivos JSON (storageState) que los otros proyectos reutilizan.
    //
    // Ventajas de este enfoque (Project Dependencies) sobre globalSetup:
    //   - El setup aparece en el HTML report con sus propios traces y screenshots.
    //   - Se puede debuggear como cualquier otro test con --debug.
    //   - Compatible con fixtures de Playwright (page, request, etc.).
    //   - Si el setup falla, Playwright cancela los proyectos dependientes
    //     con un mensaje de error claro en lugar de un fallo críptico.
    //
    // El archivo e2e/auth/global.setup.ts (generado junto a este config)
    // contiene la implementación del login y el guardado del storageState.
    //
    // ⚠️  playwright/.auth/ debe estar en .gitignore.
    //     Contiene cookies y tokens de sesión de cuentas de test.
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/
      // Sin storageState aquí: este proyecto hace el login desde cero.
    },

    // =========================================================================
    // PROYECTO: Tests de regresión visual (solo Chromium)
    // =========================================================================
    //
    // Los tests visuales se separan en su propio proyecto por dos razones:
    //   1. Los baselines son específicos por navegador. Un baseline de Chromium
    //      fallará si se compara contra Firefox (anti-aliasing diferente).
    //      Al tener proyectos separados, Playwright guarda baselines distintos
    //      en __screenshots__/chromium/ y __screenshots__/firefox/.
    //   2. Los tests visuales son más lentos (screenshots + comparación).
    //      Separarlos permite correrlos selectivamente: bun test:e2e:visual.
    //
    // Solo Chromium para los baselines primarios.
    // Añadir 'visual-firefox' y 'visual-webkit' cuando sea necesario detectar
    // diferencias visuales cross-browser específicas.
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.user,
        // Viewport fijo para consistencia absoluta de baselines.
        // NUNCA cambiar este viewport sin regenerar todos los baselines.
        viewport: { width: 1280, height: 720 }
      },
      // snapshotDir: los baselines de este proyecto se guardan aquí.
      // Commitear este directorio con el resto del código.
      snapshotDir: 'e2e/__screenshots__'
    },

    // =========================================================================
    // Desktop browsers — Tests funcionales y de accesibilidad
    // =========================================================================
    //
    // Todos los proyectos de test funcional:
    //   - Dependen del proyecto 'setup' (se ejecuta primero).
    //   - Usan el storageState guardado por 'setup' (ya están autenticados).
    //   - Incluyen tests de accesibilidad (@axe-core/playwright).
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.visual\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE.user
      }
    },

    {
      name: 'firefox',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.visual\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Firefox'],
        storageState: STORAGE_STATE.user
        // Firefox usa Gecko. Detecta diferencias CSS y comportamientos de DOM
        // que no aparecen en Chromium.
      }
    },

    {
      name: 'webkit',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.visual\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Safari'],
        storageState: STORAGE_STATE.user
        // WebKit = Safari. Importante para audiencias con dispositivos Apple.
      }
    },

    // =========================================================================
    // Dispositivos móviles
    // =========================================================================

    {
      name: 'mobile-chrome',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.visual\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: STORAGE_STATE.user
      }
    },

    {
      name: 'mobile-safari',
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.visual\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['iPhone 15'],
        storageState: STORAGE_STATE.user
      }
    }

    // ⚠️  DESCOMENTA para testear en Edge:
    // {
    //   name: 'microsoft-edge',
    //   testMatch: /.*\.spec\.ts/,
    //   testIgnore: /.*\.visual\.spec\.ts/,
    //   dependencies: ['setup'],
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //     storageState: STORAGE_STATE.user,
    //   },
    // },

    // =========================================================================
    // PROYECTO: Tests de admin (rol diferente)
    // =========================================================================
    //
    // ⚠️  DESCOMENTA si la app tiene un rol admin con flujos distintos.
    // Requiere agregar el login de admin en e2e/auth/global.setup.ts.
    //
    // {
    //   name: 'chromium-admin',
    //   testMatch: /.*\.admin\.spec\.ts/,
    //   dependencies: ['setup'],
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     storageState: STORAGE_STATE.admin,   // sesión de admin
    //   },
    // },
  ],

  // ===========================================================================
  // SERVIDOR WEB (levanta Next.js automáticamente para los tests)
  // ===========================================================================

  webServer: {
    // Comando para levantar el servidor antes de correr los tests.
    //
    // Opción 1 (recomendada para tests E2E reales): build + start de producción.
    //   command: 'bun run build && bun run start',
    //   Más lento pero testea el comportamiento real de producción.
    //
    // Opción 2 (más rápida para desarrollo): servidor de desarrollo.
    //   command: 'bun run dev',
    //   Más rápido pero puede tener diferencias con producción (React StrictMode, etc.)
    command: isCI ? 'bun run build && bun run start' : 'bun run dev',

    // URL donde Playwright espera que el servidor esté disponible.
    url: BASE_URL,

    // Si ya hay un servidor corriendo en esa URL, no levanta uno nuevo.
    // En desarrollo: true para no interrumpir el bun dev que ya tenemos corriendo.
    // En CI: false para siempre levantar un servidor limpio.
    reuseExistingServer: !isCI,

    // Tiempo máximo de espera para que el servidor levante (ms).
    timeout: 120 * 1000, // 2 minutos (el build de Next.js puede ser lento en CI)

    // Variables de entorno para el servidor de test.
    // Útil para usar una DB de test separada o flags de feature.
    env: {
      NODE_ENV: 'test'
      // DATABASE_URL: process.env.TEST_DATABASE_URL ?? '',
    }
  }
});

// =============================================================================
// 🔧 OPCIONES ADICIONALES NO INCLUIDAS (pero útiles según el caso):
//
// API Testing con Playwright (sin frontend):
//   Playwright puede testear APIs REST directamente con request.get/post/put/delete.
//   Útil para tests de integración del backend en el mismo suite E2E.
//   No requiere dependencias extra. Usar el fixture `request` de @playwright/test.
//
//   Ejemplo:
//     test('GET /api/users returns 200', async ({ request }) => {
//       const res = await request.get('/api/users')
//       expect(res.status()).toBe(200)
//     })
//
// playwright-bdd:
//   Permite escribir tests en formato Gherkin (Given/When/Then/And).
//   Útil en equipos donde QAs o Product Owners definen los escenarios.
//   bun add -d playwright-bdd
//
// @playwright/experimental-ct-react (Component Testing):
//   Permite testear componentes React individuales con Playwright,
//   sin levantar el servidor Next.js completo. Similar a Storybook.
//   bun add -d @playwright/experimental-ct-react
//   Requiere playwright-ct.config.ts separado.
//
// Checkly (monitoring visual en producción):
//   Ejecuta tests de Playwright en producción como monitores de uptime.
//   Reutiliza los mismos tests E2E como monitores de staging/producción.
//   Compatible con el config actual sin modificaciones.
// =============================================================================
