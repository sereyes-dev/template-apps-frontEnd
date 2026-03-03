// =============================================================================
// e2e/fixtures/axe.fixture.ts — Fixture reutilizable de @axe-core/playwright
// =============================================================================
//
// Este fixture extiende el objeto `test` de Playwright con una función
// `makeAxeBuilder` que proporciona un AxeBuilder pre-configurado y consistente
// para todos los tests de accesibilidad E2E.
//
// ¿Por qué @axe-core/playwright en lugar de axe-playwright?
//   @axe-core/playwright es el paquete oficial de Deque (creadores de axe-core).
//   Tiene mantenimiento activo, API más limpia (chainable), y es la opción
//   que recomienda la documentación oficial de Playwright.
//   axe-playwright es una alternativa no oficial, menos mantenida.
//
// ¿Por qué usar un fixture en lugar de importar AxeBuilder directamente?
//   Un fixture garantiza configuración consistente en todos los tests:
//   mismas reglas WCAG, mismas exclusiones, mismo nivel de reporte.
//   Sin fixture, cada test podría configurar axe de forma diferente,
//   generando falsos positivos o negativos inconsistentes entre tests.
//
// 📦 Dependencia requerida: bun add -d @axe-core/playwright
//
// USO EN LOS TESTS:
//   // Importar `test` de este fixture en lugar de @playwright/test:
//   import { test, expect } from '../fixtures/axe.fixture'
//
//   test('homepage should have no a11y violations', async ({ page, makeAxeBuilder }) => {
//     await page.goto('/')
//     const results = await makeAxeBuilder().analyze()
//     expect(results.violations).toEqual([])
//   })
//
//   // Para testear un componente específico por selector:
//   test('navigation should be accessible', async ({ page, makeAxeBuilder }) => {
//     await page.goto('/')
//     const results = await makeAxeBuilder()
//       .include('nav')          // solo analizar el nav
//       .analyze()
//     expect(results.violations).toEqual([])
//   })
//
//   // Para excluir un elemento con violación conocida y aceptada:
//   test('page with known issue should have no NEW violations', async ({ page, makeAxeBuilder }) => {
//     await page.goto('/dashboard')
//     const results = await makeAxeBuilder()
//       .exclude('.legacy-widget')   // excluir elemento legacy conocido
//       .analyze()
//     expect(results.violations).toEqual([])
//   })
// =============================================================================

import AxeBuilder from '@axe-core/playwright';
import { test as base, expect } from '@playwright/test';

// Tipo del fixture. `makeAxeBuilder` es una función factory que retorna
// un AxeBuilder nuevo y pre-configurado para cada llamada.
type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

// Extender el objeto `test` de Playwright con el fixture de axe.
// Los tests que importan este archivo tienen acceso a `makeAxeBuilder`.
export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    // Factory function: retorna un AxeBuilder nuevo en cada llamada.
    // Esto permite que cada test empiece con una configuración limpia
    // y agregue sus propias exclusiones o reglas sin afectar a otros.
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })

        // ── REGLAS WCAG ────────────────────────────────────────────────────
        //
        // withTags define qué estándares se evalúan.
        // Evaluar solo las reglas de los estándares aplicables al proyecto
        // evita falsos positivos de reglas no relevantes.
        //
        // Tags disponibles (de menor a mayor cobertura):
        //   'wcag2a'    → WCAG 2.0 Nivel A   (mínimo legal en muchos países)
        //   'wcag2aa'   → WCAG 2.0 Nivel AA  (estándar común de cumplimiento)
        //   'wcag21a'   → WCAG 2.1 Nivel A
        //   'wcag21aa'  → WCAG 2.1 Nivel AA  (recomendado para apps modernas)
        //   'wcag22aa'  → WCAG 2.2 Nivel AA  (estándar actual más completo)
        //   'best-practice' → mejores prácticas adicionales de Deque
        //   'EN-301-549'    → estándar europeo de accesibilidad (obligatorio EU desde 2025)
        //
        // Recomendación para nuevos proyectos: wcag21aa + best-practice.
        // Para proyectos con obligaciones legales en EU: agregar EN-301-549.
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])

        // ── REGLAS DESHABILITADAS ─────────────────────────────────────────
        //
        // disableRules: deshabilita reglas específicas para todo el proyecto.
        // Usar cuando una regla genera demasiados falsos positivos o cuando
        // la violación es conocida y aceptada temporalmente.
        //
        // ⚠️  Documentar siempre el motivo antes de deshabilitar una regla.
        // Las reglas deshabilitadas sin justificación crean deuda de a11y.
        .disableRules([
          // 'color-contrast' genera falsos positivos frecuentes con:
          //   - Texto sobre gradientes (axe no puede calcular el contraste real)
          //   - Texto con sombras o outline que compensan el contraste
          //   - Colores dinámicos calculados en runtime (CSS variables)
          // Evaluar el contraste manualmente con herramientas como Figma o
          // el DevTools de Chrome si se deshabilita esta regla.
          // 'color-contrast',
          // 'region' falla cuando el contenido principal no está dentro de
          // un landmark (main, nav, header, etc.). Puede dar falsos positivos
          // en páginas de error o páginas simples sin estructura landmark.
          // 'region',
        ]);

    // ── CONFIGURACIÓN DEL REPORTE ──────────────────────────────────────
    //
    // Por defecto axe retorna violaciones de todos los impactos.
    // Para enfocarse solo en violaciones críticas en CI, usar:
    // .options({ resultTypes: ['violations'] })

    await use(makeAxeBuilder);
  }
});

// Re-exportar `expect` para que los tests solo necesiten importar de este archivo.
export { expect };

// =============================================================================
// GUÍA DE INTERPRETACIÓN DE RESULTADOS
// =============================================================================
//
// results.violations  → reglas que FALLARON (debe ser [])
// results.passes      → reglas que pasaron (informativo)
// results.incomplete  → reglas que axe no pudo evaluar (requieren revisión manual)
// results.inapplicable → reglas que no aplican a esta página
//
// Cada violación tiene:
//   id          → identificador de la regla (ej: 'button-name')
//   impact      → 'critical' | 'serious' | 'moderate' | 'minor'
//   description → qué está mal
//   nodes       → array de elementos del DOM con la violación
//   helpUrl     → enlace a la documentación de Deque con la solución
//
// Para ver las violaciones en detalle durante el debugging:
//   console.log(JSON.stringify(results.violations, null, 2))
//
// Para un reporte más legible en la terminal:
//   import { createHtmlReport } from 'axe-html-reporter'
//   (requiere: bun add -d axe-html-reporter)
// =============================================================================
