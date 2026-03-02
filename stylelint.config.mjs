// =============================================================================
// stylelint.config.mjs — Configuración de Stylelint
// =============================================================================
//
// 📦 Versión: Stylelint 17.3.0
// 🛠  Stack:  Next.js 16 · CSS Modules · Tailwind CSS v4
//
// ¿Qué es Stylelint y por qué usarlo?
//   Stylelint analiza archivos CSS para detectar errores, malas prácticas
//   y forzar convenciones de equipo. Es al CSS lo que ESLint es al JS/TS.
//   Especialmente valioso en equipos donde múltiples personas escriben CSS.
//
// Plugins y configs habilitados:
//   1. stylelint-config-standard      → reglas base de CSS moderno
//   2. stylelint-config-tailwindcss   → soporte para directivas de Tailwind
//   3. stylelint-config-css-modules   → soporte para :export, :import, composes
//   4. stylelint-order                → orden semántico de propiedades CSS
//   5. stylelint-a11y                 → detección de problemas de accesibilidad
//
// =============================================================================

/** @type {import('stylelint').Config} */
const config = {
  // ---------------------------------------------------------------------------
  // CONFIGS BASE
  // ---------------------------------------------------------------------------

  extends: [
    // -------------------------------------------------------------------------
    // 1. stylelint-config-standard
    //    La base de toda la configuración. Incluye dos capas:
    //
    //    stylelint-config-recommended (capa inferior):
    //      Activa las reglas que detectan errores reales: selectores inválidos,
    //      propiedades desconocidas, valores incorrectos, duplicados, etc.
    //      Es el mínimo que cualquier proyecto CSS debería tener.
    //
    //    stylelint-config-standard (capa superior):
    //      Agrega reglas de estilo y consistencia sobre la capa recommended:
    //      notación de colores, formato de declaraciones, uso de comillas,
    //      espaciado, soporte para CSS moderno (nesting, custom properties,
    //      @layer, @container, cascade layers).
    //
    //    Alternativas:
    //      'stylelint-config-standard-scss' → para proyectos con SCSS.
    //        Extiende config-standard y agrega soporte para variables $,
    //        mixins @include, funciones SCSS, y sintaxis de anidamiento SCSS.
    //        bun add -d stylelint-config-standard-scss
    //
    //      'stylelint-config-recommended' → solo errores, sin reglas de estilo.
    //        Más permisiva. Útil en proyectos legacy con CSS muy heterogéneo
    //        donde aplicar todas las reglas de estilo sería abrumador.
    'stylelint-config-standard',

    // -------------------------------------------------------------------------
    // 2. stylelint-config-tailwindcss
    //    Permite el uso de todas las directivas de Tailwind v4 sin errores.
    //
    //    Qué hace:
    //      Sin esta config, Stylelint marcaría como errores desconocidos:
    //        @tailwind base/components/utilities  → at-rule desconocido
    //        @apply flex items-center             → at-rule desconocido
    //        @layer components { }               → at-rule desconocido
    //        @theme { --color-brand: ... }       → at-rule desconocido (Tailwind v4)
    //        @variant hover { }                  → at-rule desconocido (Tailwind v4)
    //
    //    Esta config desactiva selectivamente las reglas que generan
    //    falsos positivos con Tailwind, sin desactivar el resto del linting.
    //
    //    Compatibilidad:
    //      Funciona con Tailwind v3 (config-based) y v4 (CSS-based).
    //      Las reglas at-rule-no-unknown de más abajo complementan esta config
    //      con directivas adicionales específicas del proyecto.
    //
    //    ⚠️ IMPORTANTE: debe ir DESPUÉS de stylelint-config-standard para que
    //       sus overrides tengan prioridad sobre las reglas base.
    'stylelint-config-tailwindcss',

    // -------------------------------------------------------------------------
    // 3. stylelint-config-css-modules
    //    Soporte completo para la sintaxis específica de CSS Modules.
    //
    //    Qué habilita:
    //      :local(.className)  → selector de scope local
    //      :global(.className) → selector de scope global
    //      :export { }         → exporta valores a JavaScript
    //      :import("./file")   → importa valores de otro CSS Module
    //      composes: className from "./other.module.css"  → composición
    //
    //    Sin esta config, todas las construcciones anteriores serían marcadas
    //    como errores por las reglas de selector y at-rule de stylelint-config-standard.
    //
    //    Alternativa manual:
    //      Configurar selector-pseudo-class-no-unknown con ignorePseudoClasses
    //      (ya lo hacemos más abajo), pero stylelint-config-css-modules es más
    //      completo y cubre casos edge que la configuración manual puede perder.
    //
    //    ⚠️ IMPORTANTE: debe ir al final del array extends para que sus
    //       overrides tengan la máxima prioridad.
    'stylelint-config-css-modules'
  ],

  // ---------------------------------------------------------------------------
  // PLUGINS
  // ---------------------------------------------------------------------------

  plugins: [
    // -------------------------------------------------------------------------
    // 4. stylelint-order
    //    Permite definir y forzar un orden específico para las propiedades CSS
    //    dentro de cada bloque de declaraciones.
    //
    //    ¿Por qué ordenar las propiedades?
    //    Un orden consistente hace el CSS más predecible y escaneable.
    //    Al revisar un componente, siempre sabes dónde buscar el posicionamiento,
    //    el tamaño, los colores, etc. Reduce el tiempo de revisión en code reviews.
    //
    //    Este plugin habilita las reglas order/* que se configuran más abajo
    //    en la sección de reglas. El orden elegido es semántico (por categoría
    //    de propiedad), que es más intuitivo que el orden alfabético.
    //
    //    Alternativa al orden semántico: orden alfabético.
    //      Más simple de recordar y sin necesidad de una lista de configuración,
    //      pero menos intuitivo al escribir CSS (escribes por semántica, no por letra).
    //      Para usar orden alfabético: 'order/properties-alphabetical-order': true
    'stylelint-order',

    // -------------------------------------------------------------------------
    // 5. stylelint-a11y
    //    Detecta automáticamente problemas de accesibilidad en el CSS.
    //
    //    ¿Por qué es importante?
    //    Muchos problemas de accesibilidad se originan en el CSS y son difíciles
    //    de detectar en revisiones manuales. Este plugin los detecta en tiempo
    //    de desarrollo, antes de que lleguen a producción.
    //
    //    Reglas que activa (configuradas en la sección rules más abajo):
    //      a11y/no-outline-none          → prohíbe outline:none sin alternativa
    //      a11y/no-display-none-without-visible-text → evita ocultar texto que
    //                                                  los lectores de pantalla necesitan
    //      a11y/font-size-is-readable    → fuentes mínimas legibles
    //      a11y/no-text-align-justify    → evita texto justificado (difícil de leer)
    //      a11y/selector-pseudo-class-focus → fuerza estilos de foco visibles
    //      a11y/content-property-no-static-value → evita content: con texto real
    //
    //    Alternativa: lint-a11y-preset (preset preconfigurado, menos granular).
    '@double-great/stylelint-a11y'
  ],

  // ---------------------------------------------------------------------------
  // REGLAS PERSONALIZADAS
  // ---------------------------------------------------------------------------

  rules: {
    // =========================================================================
    // REGLAS DE NOMENCLATURA (especialmente importantes en equipos)
    // =========================================================================

    // Patrón para nombres de clases CSS.
    // null = desactivado. Permite cualquier nombre, incluyendo los generados
    //        por CSS Modules (que usan camelCase) y los de Tailwind (con /).
    //
    // Alternativa para proyectos sin CSS Modules (solo BEM):
    //   'selector-class-pattern': ['^[a-z][a-z0-9-]*$', { message: 'Usa kebab-case para clases' }]
    //
    // Alternativa para camelCase puro (CSS Modules):
    //   'selector-class-pattern': '^[a-z][a-zA-Z0-9]*$'
    'selector-class-pattern': null,

    // Patrón para nombres de Custom Properties (variables CSS).
    // Fuerza el uso de kebab-case: --color-primary, --font-size-lg.
    // Ayuda a mantener consistencia en variables del design system.
    //
    // Alternativa: null para permitir cualquier nombre.
    'custom-property-pattern': '^[a-z][a-z0-9-]*$',

    // Patrón para @keyframes.
    // Permite camelCase y kebab-case: fadeIn, fade-in, slideFromLeft.
    // null = desactivado (cualquier nombre es válido).
    'keyframes-name-pattern': null,

    // =========================================================================
    // UNIDADES Y VALORES
    // =========================================================================

    // Unidades no permitidas.
    // px está permitido (null = no hay restricción).
    //
    // Alternativa para proyectos que prefieren rem/em sobre px:
    //   'unit-disallowed-list': ['px']
    //   Útil para forzar accesibilidad (texto escalable con preferencias del usuario).
    'unit-disallowed-list': null,

    // Permite valores numéricos sin unidades solo en las propiedades donde
    // tiene sentido (line-height: 1.5 es válido; margin: 10 no lo es).
    // Esta regla está incluida en stylelint-config-standard, aquí se documenta.
    'number-max-precision': 4, // máximo 4 decimales: 1.5625rem, 0.0625em

    // =========================================================================
    // COLORES
    // =========================================================================

    // Fuerza notación moderna de colores.
    // 'modern': rgb(0 0 0) en vez de rgb(0, 0, 0)
    // Útil para mantener consistencia con CSS moderno.
    //
    // Alternativa: 'legacy' si se necesita compatibilidad con navegadores muy antiguos.
    // Alternativa: null para permitir ambas notaciones.
    'color-function-notation': 'modern',

    // Fuerza el uso de variables CSS para colores en lugar de valores hardcoded.
    // ⚠️  COMENTA si tu proyecto no tiene un sistema de design tokens.
    // Alternativa: añadir una lista de colores permitidos para excepciones.
    //   'color-no-invalid-hex': true  (ya incluido en config-standard)

    // =========================================================================
    // IMPORTS Y ESTRUCTURA
    // =========================================================================

    // Permite @import en CSS (Next.js lo maneja con su bundler).
    // Algunos proyectos prefieren deshabilitar @import en favor de bundling.
    'import-notation': 'string', // @import "file.css" en vez de @import url("file.css")

    // =========================================================================
    // COMPATIBILIDAD CON CSS MODULES Y NEXT.JS
    // =========================================================================

    // CSS Modules usa :global() y :local() que no son CSS estándar.
    // Esta regla permite pseudo-clases no estándar necesarias para CSS Modules.
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          'global', // :global(.class) en CSS Modules
          'local', // :local(.class) en CSS Modules
          'export' // :export { } en CSS Modules
        ]
      }
    ],

    // Permite at-rules no estándar de Tailwind y Next.js.
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind', // @tailwind base/components/utilities
          'apply', // @apply utility-class
          'layer', // @layer components { }
          'config', // @config "./tailwind.config.ts"
          'plugin', // @plugin
          'theme', // @theme en Tailwind v4
          'source', // @source en Tailwind v4
          'utility', // @utility en Tailwind v4
          'variant', // @variant en Tailwind v4
          'custom-variant', // @custom-variant en Tailwind v4
          'responsive', // @responsive (Tailwind legacy)
          'screen', // @screen sm { }
          'value' // @value en CSS Modules
        ]
      }
    ],

    // Permite propiedades desconocidas usadas por Tailwind (ej: --tw-*)
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          // Propiedades experimentales o vendor-specific que Stylelint no reconoce
        ]
      }
    ],

    // =========================================================================
    // REGLAS DE CALIDAD
    // =========================================================================

    // Evita selectores duplicados en la misma hoja de estilos.
    // Importante en equipos para prevenir override accidentales.
    'no-duplicate-selectors': true,

    // Evita propiedades duplicadas dentro del mismo bloque.
    'declaration-block-no-duplicate-properties': [
      true,
      {
        // Permite duplicados cuando se usa para fallback de navegadores:
        // background: red;
        // background: var(--color-primary, red);
        ignore: ['consecutive-duplicates-with-different-values']
      }
    ],

    // Limita la especificidad de los selectores.
    // Evita el "infierno de especificidad" que genera CSS imposible de mantener.
    // [0, 4, 0] = máximo 4 clases, 0 IDs, 0 elementos (muy permisivo).
    //
    // Alternativa más estricta para proyectos grandes:
    //   'selector-max-specificity': '0,2,0'  (máximo 2 clases)
    //
    // Alternativa: null para no limitar (útil en proyectos legacy).
    'selector-max-specificity': '0,4,0',

    // Evita el uso de IDs como selectores CSS.
    // Los IDs tienen especificidad muy alta y dificultan el mantenimiento.
    // Alternativa: null si el proyecto requiere IDs (formularios, anchors).
    'selector-max-id': 0,

    // Limita el anidamiento de selectores (CSS nativo moderno).
    // 3 niveles es suficiente para la mayoría de componentes.
    // Más anidamiento suele indicar un problema de arquitectura CSS.
    'selector-max-compound-selectors': 4,

    // =========================================================================
    // ORDEN DE PROPIEDADES — stylelint-order
    // =========================================================================
    //
    // Se usa orden SEMÁNTICO en lugar de alfabético porque refleja mejor
    // cómo los desarrolladores piensan al escribir CSS: primero ubico el elemento,
    // luego defino su tamaño, luego su apariencia, finalmente las interacciones.
    //
    // Alternativa: 'order/properties-alphabetical-order': true
    //   Más simple de recordar, no necesita configuración, pero menos intuitivo.
    //   Cada equipo debe elegir uno u otro y ser consistente.
    //
    // El orden elegido sigue la convención RECESS (usada por Bootstrap y Twitter):
    //   1. Posicionamiento     → define dónde está el elemento en el flujo
    //   2. Box model           → define el espacio que ocupa
    //   3. Tipografía          → define el texto
    //   4. Visual              → define colores, fondos, bordes
    //   5. Accesibilidad/misc  → cursor, pointer-events, visibility
    //   6. Animaciones         → transiciones y keyframes

    'order/properties-order': [
      // -----------------------------------------------------------------------
      // GRUPO 1: Posicionamiento
      // Primero porque saca el elemento del flujo normal del documento.
      // Su posición afecta a todo lo demás.
      // -----------------------------------------------------------------------
      {
        groupName: 'Posicionamiento',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'position',
          'inset',
          'inset-block',
          'inset-block-start',
          'inset-block-end',
          'inset-inline',
          'inset-inline-start',
          'inset-inline-end',
          'top',
          'right',
          'bottom',
          'left',
          'z-index',
          'float',
          'clear'
        ]
      },

      // -----------------------------------------------------------------------
      // GRUPO 2: Display y modelo de caja
      // Define cómo se renderiza el elemento y cuánto espacio ocupa.
      // Incluye Flexbox y Grid que son los sistemas de layout más usados.
      // -----------------------------------------------------------------------
      {
        groupName: 'Display y Layout',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'display',
          'visibility',
          'overflow',
          'overflow-x',
          'overflow-y',
          'overflow-clip-margin',

          // Flexbox
          'flex',
          'flex-direction',
          'flex-wrap',
          'flex-flow',
          'flex-grow',
          'flex-shrink',
          'flex-basis',
          'justify-content',
          'justify-items',
          'justify-self',
          'align-content',
          'align-items',
          'align-self',
          'gap',
          'row-gap',
          'column-gap',
          'order',

          // Grid
          'grid',
          'grid-template',
          'grid-template-columns',
          'grid-template-rows',
          'grid-template-areas',
          'grid-area',
          'grid-column',
          'grid-column-start',
          'grid-column-end',
          'grid-row',
          'grid-row-start',
          'grid-row-end',
          'grid-auto-columns',
          'grid-auto-rows',
          'grid-auto-flow'
        ]
      },

      // -----------------------------------------------------------------------
      // GRUPO 3: Box model (tamaño y espaciado)
      // Define el espacio físico del elemento.
      // -----------------------------------------------------------------------
      {
        groupName: 'Box Model',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'box-sizing',
          'width',
          'min-width',
          'max-width',
          'height',
          'min-height',
          'max-height',
          'aspect-ratio',
          'margin',
          'margin-top',
          'margin-right',
          'margin-bottom',
          'margin-left',
          'margin-block',
          'margin-block-start',
          'margin-block-end',
          'margin-inline',
          'margin-inline-start',
          'margin-inline-end',
          'padding',
          'padding-top',
          'padding-right',
          'padding-bottom',
          'padding-left',
          'padding-block',
          'padding-block-start',
          'padding-block-end',
          'padding-inline',
          'padding-inline-start',
          'padding-inline-end'
        ]
      },

      // -----------------------------------------------------------------------
      // GRUPO 4: Tipografía
      // Define cómo se ve el texto dentro del elemento.
      // -----------------------------------------------------------------------
      {
        groupName: 'Tipografía',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'font',
          'font-family',
          'font-size',
          'font-weight',
          'font-style',
          'font-variant',
          'font-stretch',
          'font-display',
          'line-height',
          'letter-spacing',
          'word-spacing',
          'text-align',
          'text-align-last',
          'text-decoration',
          'text-decoration-color',
          'text-decoration-line',
          'text-decoration-style',
          'text-decoration-thickness',
          'text-indent',
          'text-overflow',
          'text-shadow',
          'text-transform',
          'text-wrap',
          'white-space',
          'word-break',
          'word-wrap',
          'overflow-wrap',
          'vertical-align',
          'list-style',
          'list-style-type',
          'list-style-position',
          'list-style-image'
        ]
      },

      // -----------------------------------------------------------------------
      // GRUPO 5: Apariencia visual
      // Define colores, fondos, bordes y efectos visuales.
      // -----------------------------------------------------------------------
      {
        groupName: 'Visual',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'color',
          'opacity',
          'background',
          'background-color',
          'background-image',
          'background-repeat',
          'background-position',
          'background-size',
          'background-attachment',
          'background-origin',
          'background-clip',
          'border',
          'border-width',
          'border-style',
          'border-color',
          'border-top',
          'border-right',
          'border-bottom',
          'border-left',
          'border-block',
          'border-inline',
          'border-radius',
          'border-top-left-radius',
          'border-top-right-radius',
          'border-bottom-right-radius',
          'border-bottom-left-radius',
          'border-collapse',
          'border-spacing',
          'outline',
          'outline-width',
          'outline-style',
          'outline-color',
          'outline-offset',
          'box-shadow',
          'filter',
          'backdrop-filter',
          'mix-blend-mode',
          'isolation',
          'clip-path',
          'mask',
          'object-fit',
          'object-position',
          'content',
          'counter-reset',
          'counter-increment',
          'resize',
          'appearance',
          'user-select'
        ]
      },

      // -----------------------------------------------------------------------
      // GRUPO 6: Interacciones y accesibilidad
      // Define comportamiento del cursor y gestos de usuario.
      // -----------------------------------------------------------------------
      {
        groupName: 'Interacciones',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'cursor',
          'pointer-events',
          'touch-action',
          'scroll-behavior',
          'scroll-snap-type',
          'scroll-snap-align',
          'overscroll-behavior',
          'will-change'
        ]
      },

      // -----------------------------------------------------------------------
      // GRUPO 7: Animaciones y transiciones
      // Van al final porque son "capas" sobre el estado visual base.
      // -----------------------------------------------------------------------
      {
        groupName: 'Animaciones',
        emptyLineBefore: 'never',
        noEmptyLineBetween: true,
        properties: [
          'transition',
          'transition-property',
          'transition-duration',
          'transition-timing-function',
          'transition-delay',
          'animation',
          'animation-name',
          'animation-duration',
          'animation-timing-function',
          'animation-delay',
          'animation-iteration-count',
          'animation-direction',
          'animation-fill-mode',
          'animation-play-state',
          'transform',
          'transform-origin',
          'transform-style',
          'perspective',
          'perspective-origin',
          'backface-visibility'
        ]
      }
    ],

    // =========================================================================
    // ACCESIBILIDAD CSS — stylelint-a11y
    // =========================================================================

    // ✅ Prohíbe outline: none o outline: 0 sin proporcionar un estilo de foco
    //    alternativo. Los indicadores de foco son esenciales para navegación
    //    con teclado (WCAG 2.4.7 - Focus Visible).
    //
    //    Correcto:   .btn:focus { outline: none; box-shadow: 0 0 0 3px blue; }
    //    Incorrecto: .btn:focus { outline: none; }    ← sin alternativa de foco
    //
    //    Alternativa: 'warn' si hay muchos casos legacy que corregir gradualmente.
    'a11y/no-outline-none': true,

    // ✅ Verifica que el tamaño de fuente sea legible.
    //    WCAG recomienda un mínimo de 9px. La mayoría de guías de UX sugieren 14px+.
    //    Este plugin detecta fuentes muy pequeñas que dificultan la lectura.
    //
    //    Especialmente importante para: texto de ayuda, labels, notas al pie.
    'a11y/font-size-is-readable': true,

    // ✅ Evita text-align: justify en bloques de texto.
    //    El texto justificado crea "ríos blancos" irregulares que dificultan la
    //    lectura para personas con dislexia o baja visión (WCAG 1.4.8).
    //
    //    Alternativa: 'warn' si el equipo decide usarlo en casos muy específicos.
    'a11y/no-text-align-justify': true,

    // ✅ Detecta uso de content: con texto visible en ::before/::after.
    //    El texto generado por CSS no es accesible para lectores de pantalla.
    //    Ejemplo problemático: .icon::before { content: "Descargar"; }
    //    Solución: usar aria-label en el HTML en lugar de texto en CSS.
    //
    //    Alternativa: 'warn' durante la migración de código legacy.
    'a11y/content-property-no-static-value': true,

    // ✅ Fuerza que los pseudo-selectores :focus tengan estilos visibles.
    //    Complementa a11y/no-outline-none asegurando que el foco siempre
    //    sea visible de alguna manera (outline, box-shadow, background, etc.)
    'a11y/selector-pseudo-class-focus': true
  },

  // ---------------------------------------------------------------------------
  // ARCHIVOS A IGNORAR
  // ---------------------------------------------------------------------------

  ignoreFiles: [
    '.next/**',
    'out/**',
    'dist/**',
    'build/**',
    'node_modules/**',
    'coverage/**',
    'public/**',
    // Archivos generados automáticamente
    '**/*.min.css'
  ]
};

export default config;

// =============================================================================
// 🔧 OPCIONES ADICIONALES NO INCLUIDAS (pero útiles según el caso):
//
// stylelint-config-standard-scss
//   Reemplaza 'stylelint-config-standard' para proyectos que usan SCSS.
//   Agrega soporte completo para: variables $var, mixins @include/@mixin,
//   funciones SCSS (darken, lighten), extends %placeholder, y anidamiento SCSS.
//   ⚠️  No usar junto a stylelint-config-standard (son mutuamente excluyentes).
//   bun add -d stylelint-config-standard-scss
//   En extends: reemplazar 'stylelint-config-standard' por 'stylelint-config-standard-scss'
//
// @double-great/stylelint-config-css-in-js
//   Para proyectos que usan styled-components o emotion junto con CSS puro.
//   Permite que Stylelint analice los template literals de CSS-in-JS.
//   No es común con Next.js + Tailwind (que usan CSS Modules), pero útil
//   si el proyecto migra desde un stack con styled-components.
//   bun add -d @double-great/stylelint-config-css-in-js
//
// stylelint-high-performance-animations
//   Detecta animaciones CSS que no usan las propiedades de alto rendimiento
//   (transform, opacity). Las animaciones de layout (width, height, top, left)
//   fuerzan reflows en el browser y causan jank en pantallas de 60fps+.
//   Muy útil para proyectos con animaciones complejas o apps móviles.
//   bun add -d stylelint-high-performance-animations
//   Regla a agregar: 'plugin/no-low-performance-animation-properties': true
//
// stylelint-no-unsupported-browser-features
//   Detecta propiedades CSS no soportadas por los navegadores objetivo del proyecto.
//   Se integra con browserslist (.browserslistrc) para conocer el target.
//   Útil para proyectos enterprise con soporte de navegadores específico.
//   bun add -d stylelint-no-unsupported-browser-features
// =============================================================================

// =============================================================================
// 📦 COMANDO DE INSTALACIÓN DE TODOS LOS PLUGINS
//
// Copia y pega este comando para instalar todas las dependencias de una vez:
//
// bun add -d stylelint stylelint-config-standard stylelint-config-tailwindcss stylelint-config-css-modules stylelint-order @double-great/stylelint-a11y
//
// =============================================================================
