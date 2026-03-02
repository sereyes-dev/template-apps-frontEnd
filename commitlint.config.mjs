// =============================================================================
// commitlint.config.frontend.mjs — Commitlint + cz-git (Frontend)
// =============================================================================
//
// 📦 Versiones:
//   @commitlint/cli 20.4.2
//   @commitlint/config-conventional 20.4.2
//   commitizen 4.x
//   cz-git 1.12.0
//
// 🛠  Stack: Next.js 16 · TypeScript · Tailwind CSS · Bun · Husky 9.x
//
// ¿Por qué cz-git y no otras alternativas?
//   cz-git es el único adapter que:
//     1. Se configura directamente en commitlint.config.mjs (un solo archivo).
//     2. Tiene useEmoji nativo: agrega el emoji automáticamente según el type.
//     3. Tiene emojiAlign: alinea emojis en el menú del terminal.
//     4. Es 100% compatible con @commitlint/config-conventional.
//     5. Tiene mantenimiento activo (última versión: marzo 2025, v1.12.0).
//
//   Alternativas descartadas:
//     commitlint-config-gitmoji → abandonado (3 años sin updates)
//     cz-emoji-conventional     → abandonado (1 año sin updates)
//     cz-conventional-emoji     → funcional pero requiere .czrc separado
//
// Arquitectura del archivo:
//   Este archivo tiene DOS secciones principales:
//     [1] Reglas de commitlint → validan el mensaje DESPUÉS del commit
//     [2] prompt (cz-git)      → configuran el wizard ANTES del commit
//   cz-git lee la sección `prompt` de este mismo archivo, eliminando
//   la necesidad de un .czrc o .cz-config.js adicional.
//
// =============================================================================

/** @type {import('cz-git').UserConfig} */
const config = {
    // ---------------------------------------------------------------------------
    // [1] REGLAS DE COMMITLINT
    //     Validan el mensaje de commit generado por cz-git (o escrito a mano).
    // ---------------------------------------------------------------------------

    extends: ['@commitlint/config-conventional'],

    // El parserPreset reconoce el emoji que cz-git agrega al inicio del header.
    // Resultado final del commit: ✨ feat(auth): add Google OAuth login
    parserPreset: {
        parserOpts: {
            headerPattern:
                /^([\p{Emoji_Presentation}\p{Extended_Pictographic}\s]*)\s*(\w+)(?:\(([^)]+)\))?(!)?\s*:\s+(.+?)\s*$/u,
            headerCorrespondence: ['emojiStart', 'type', 'scope', 'breaking', 'subject'],
            noteKeywords: ['BREAKING CHANGE', 'BREAKING-CHANGE'],
            issuePrefixes: ['Fixes ', 'Closes ', 'Related to ', 'Refs '],
        },
    },

    formatter: '@commitlint/format',

    rules: {
        // =========================================================================
        // TYPE
        // =========================================================================

        'type-enum': [
            2,
            'always',
            [
                'feat',      // ✨ nueva funcionalidad
                'fix',       // 🐛 corrección de bug
                'docs',      // 📝 documentación
                'style',     // 💄 estilos CSS / formato
                'refactor',  // ♻️  reestructuración
                'perf',      // ⚡ rendimiento
                'test',      // 🧪 tests
                'build',     // 🏗️  build y dependencias
                'ci',        // 💚 CI/CD
                'chore',     // 🔧 mantenimiento
                'revert',    // ⏪ revertir
            ],
        ],

        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],

        // =========================================================================
        // SCOPE — módulos del frontend Next.js (warning, no error)
        // =========================================================================

        'scope-enum': [
            1,
            'always',
            [
                'app', 'pages', 'layout', 'middleware',
                'ui', 'components', 'icons', 'animations',
                'auth', 'api', 'hooks', 'context', 'store', 'forms',
                'fetch', 'cache', 'types', 'styles', 'tailwind',
                'config', 'deps', 'tests', 'ci', 'a11y', 'seo', 'i18n',
            ],
        ],

        'scope-case': [2, 'always', 'lower-case'],

        // =========================================================================
        // SUBJECT
        // =========================================================================

        'subject-empty': [2, 'never'],
        'header-max-length': [2, 'always', 110],
        'header-min-length': [2, 'always', 10],
        'subject-full-stop': [2, 'never', '.'],
        'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],

        // =========================================================================
        // BODY Y FOOTER
        // =========================================================================

        'body-leading-blank': [2, 'always'],
        'body-max-line-length': [2, 'always', 100],
        'footer-leading-blank': [2, 'always'],
        'footer-max-line-length': [2, 'always', 100],
    },

    ignores: [
        (commit) => commit.startsWith('Merge '),
        (commit) => commit.startsWith('Revert "'),
        (commit) => /^v\d+\.\d+\.\d+/.test(commit),
    ],

    defaultIgnores: true,
    helpUrl: 'https://www.conventionalcommits.org/en/v1.0.0/',

    // ---------------------------------------------------------------------------
    // [2] CONFIGURACIÓN DEL WIZARD — cz-git (sección `prompt`)
    //
    // Esta sección configura el CLI interactivo que aparece al correr `bun run cm`.
    // cz-git lee automáticamente esta sección del commitlint.config.mjs.
    // ---------------------------------------------------------------------------

    prompt: {
        // =========================================================================
        // EMOJIS
        // =========================================================================

        // useEmoji: agrega el emoji del type elegido al inicio del commit.
        //   Al seleccionar "refactor" → el commit queda: ♻️  refactor(scope): subject
        //   Al seleccionar "feat"     → el commit queda: ✨ feat(scope): subject
        useEmoji: true,

        // emojiAlign: posición del emoji en la lista del MENÚ del terminal.
        //   'left'   → ✨ feat:    descripción     ← más legible, icono-primero
        //   'center' → feat ✨:   descripción
        //   'right'  → feat:   descripción ✨
        //
        // 'left' es el estándar de UX: el ojo escanea de izquierda a derecha,
        // el emoji actúa como ícono visual antes de leer el texto del type.
        emojiAlign: 'left',

        // themeColorCode: color del encabezado del wizard en la terminal (ANSI 8-bit).
        // 38;5;043 = verde-azulado. Referencia: https://en.wikipedia.org/wiki/ANSI_escape_code
        themeColorCode: '38;5;043',

        // =========================================================================
        // TIPOS — lista del wizard con emojis asignados a cada type
        // =========================================================================
        //
        // `emoji`: código gitmoji que cz-git convierte a unicode automáticamente.
        // Los emojis en `name` son solo decoración visual en el menú.
        // El emoji que se escribe en el commit viene del campo `emoji`.

        types: [
            {
                value: 'feat',
                name: 'feat:     ✨  A new feature',
                emoji: ':sparkles:',
                description: 'Nuevo componente, hook, página, feature flag, integración',
            },
            {
                value: 'fix',
                name: 'fix:      🐛  A bug fix',
                emoji: ':bug:',
                description: 'Corrección de bug: visual, funcional o de lógica de negocio',
            },
            {
                value: 'docs',
                name: 'docs:     📝  Documentation only',
                emoji: ':memo:',
                description: 'README, JSDoc, comentarios de código, Storybook docs',
            },
            {
                value: 'style',
                name: 'style:    💄  UI styles & formatting',
                emoji: ':lipstick:',
                description: 'CSS, Tailwind, diseño visual, formato de código (Prettier)',
            },
            {
                value: 'refactor',
                name: 'refactor: ♻️   Code refactoring',
                emoji: ':recycle:',
                description: 'Extraer componente, renombrar, reorganizar módulo o hook',
            },
            {
                value: 'perf',
                name: 'perf:     ⚡  Performance improvement',
                emoji: ':zap:',
                description: 'Memoización, lazy loading, code splitting, reduce re-renders',
            },
            {
                value: 'test',
                name: 'test:     🧪  Tests',
                emoji: ':test_tube:',
                description: 'Tests unitarios (Vitest), integración, E2E (Playwright)',
            },
            {
                value: 'build',
                name: 'build:    🏗️   Build & dependencies',
                emoji: ':building_construction:',
                description: 'next.config.ts, tailwind.config, package.json deps',
            },
            {
                value: 'ci',
                name: 'ci:       💚  CI/CD',
                emoji: ':green_heart:',
                description: 'GitHub Actions, Vercel config, Docker, deployment workflows',
            },
            {
                value: 'chore',
                name: 'chore:    🔧  Maintenance',
                emoji: ':wrench:',
                description: 'Herramientas de dev, .gitignore, configs de linting/testing',
            },
            {
                value: 'revert',
                name: 'revert:   ⏪  Revert a commit',
                emoji: ':rewind:',
                description: 'Revierte un commit anterior',
            },
        ],

        // =========================================================================
        // SCOPES — sugerencias con autocompletado en el wizard
        // =========================================================================

        scopes: [
            { value: 'app', name: 'app:        estructura de app/ (App Router)' },
            { value: 'pages', name: 'pages:      rutas y páginas' },
            { value: 'layout', name: 'layout:     layouts compartidos' },
            { value: 'middleware', name: 'middleware: middleware.ts de Next.js' },
            { value: 'ui', name: 'ui:         componentes reutilizables' },
            { value: 'components', name: 'components: componentes de feature' },
            { value: 'icons', name: 'icons:      iconografía y SVGs' },
            { value: 'animations', name: 'animations: animaciones y transiciones' },
            { value: 'auth', name: 'auth:       autenticación y sesiones' },
            { value: 'api', name: 'api:        route handlers (app/api/)' },
            { value: 'hooks', name: 'hooks:      custom hooks de React' },
            { value: 'context', name: 'context:    React Context providers' },
            { value: 'store', name: 'store:      estado global (Zustand, Jotai)' },
            { value: 'forms', name: 'forms:      formularios y validación (Zod)' },
            { value: 'fetch', name: 'fetch:      fetching y server actions' },
            { value: 'cache', name: 'cache:      estrategias de caché de Next.js' },
            { value: 'types', name: 'types:      tipos e interfaces TypeScript' },
            { value: 'styles', name: 'styles:     CSS global, variables, themes' },
            { value: 'tailwind', name: 'tailwind:   configuración de Tailwind' },
            { value: 'config', name: 'config:     archivos de configuración' },
            { value: 'deps', name: 'deps:       dependencias npm' },
            { value: 'tests', name: 'tests:      configuración de Vitest/Playwright' },
            { value: 'ci', name: 'ci:         workflows de CI/CD' },
            { value: 'a11y', name: 'a11y:       accesibilidad' },
            { value: 'seo', name: 'seo:        metadatos y SEO' },
            { value: 'i18n', name: 'i18n:       internacionalización' },
        ],

        // =========================================================================
        // COMPORTAMIENTO DEL WIZARD
        // =========================================================================

        // Permite seleccionar múltiples scopes separados por coma.
        // false → solo un scope por commit (más limpio y convencional).
        enableMultipleScopes: false,

        // Texto del scope vacío (sin scope) en el menú.
        emptyScopesAlias: 'empty  (sin scope)',
        customScopesAlias: 'custom (escribir scope manualmente)',

        // No transforma el subject a mayúsculas automáticamente.
        // El estándar Conventional Commits usa lowercase.
        upperCaseSubject: false,

        // Carácter para saltos de línea en el body del wizard.
        // "Mi primera línea|Mi segunda línea" → dos párrafos en el body.
        breaklineChar: '|',

        // Preguntas del wizard que se muestran siempre.
        // Vacío = se muestran todas las preguntas (recomendado para equipos).
        skipQuestions: [],

        // Prefijos de issue disponibles en el prompt de footer.
        issuePrefixes: [
            { value: 'Closes', name: 'Closes:     cierra el issue al hacer merge' },
            { value: 'Fixes', name: 'Fixes:      marca el issue como resuelto' },
            { value: 'Related to', name: 'Related to: referencia sin cerrar el issue' },
            { value: 'Refs', name: 'Refs:       referencia general' },
        ],

        customIssuePrefixAlign: 'left',
        confirmColorize: true,

        // =========================================================================
        // MENSAJES DEL WIZARD (en español)
        // =========================================================================

        messages: {
            type: '¿Qué tipo de cambio estás commiteando?',
            scope: '¿Cuál es el alcance del cambio? (opcional, Tab para sugerencias)',
            customScope: 'Escribe el scope manualmente:',
            subject: 'Describe brevemente el cambio (imperativo: "add", "fix", "update"):',
            body: 'Descripción detallada (opcional, usa "|" para nuevas líneas):',
            breaking: 'Lista los BREAKING CHANGES (deja vacío si no aplica):',
            footerPrefixsSelect: '¿Este commit referencia algún issue?',
            customFooterPrefixs: 'Escribe el prefijo del issue:',
            footer: 'Issues referenciados (ej: Closes #123, Fixes #456):',
            confirmCommit: '¿Confirmas este commit?',
        },
    },
}

export default config

// =============================================================================
// 📋 GUÍA DE USO — FRONTEND
//
// INICIAR EL WIZARD:
//   bun run cm    → abre el wizard interactivo
//   git cz        → equivalente
//
// FLUJO DEL WIZARD:
//   1. Tipo de cambio  → menú con emojis alineados a la izquierda
//   2. Scope           → autocompletado con Tab, o scope personalizado
//   3. Descripción     → texto corto en imperativo presente
//   4. Body            → detalle extendido (usa | para saltos de línea)
//   5. Breaking change → describe cambios que rompen compatibilidad
//   6. Footer          → referencias a issues (Closes #123)
//   7. Confirmar       → preview del commit completo antes de confirmar
//
// COMMITS RESULTANTES:
//   ✨ feat(auth): add Google OAuth login
//   🐛 fix(ui): correct button overflow on mobile
//   ♻️  refactor(hooks): extract useAuth to custom hook
//   📝 docs: update component API documentation
//   ⚡ perf(dashboard): memoize heavy chart calculations
//   💄 style(components): apply new design system tokens
//   💚 ci: add Playwright E2E to deployment pipeline
//   🔧 chore(config): update ESLint rules
// =============================================================================

// =============================================================================
// 📦 COMANDO DE INSTALACIÓN DE TODOS LOS PLUGINS
//
// Copia y pega este comando para instalar todas las dependencias de una vez:
//
// bun add -d @commitlint/cli @commitlint/config-conventional commitizen cz-git
//
// 🔗 CONFIGURACIÓN EN package.json (agregar estas secciones):
//   "scripts": {
//     "cm": "git cz"
//   },
//   "config": {
//     "commitizen": {
//       "path": "node_modules/cz-git"
//     }
//   }
//
//   ⚠️  Usar "cm" y no "commit" para evitar que Husky ejecute el
//   hook precommit dos veces (limitación de npm scripts con Husky).
//
// 🔗 HOOKS DE HUSKY:
//   .husky/commit-msg     → valida el mensaje final con commitlint:
//     bunx commitlint --edit "$1" --config commitlint.config.frontend.mjs
//
//   .husky/prepare-commit-msg → abre el wizard al hacer git commit:
//     exec < /dev/tty && node_modules/.bin/cz --hook || true
//
// 🚀 USO DIARIO:
//   bun run cm   → abre el wizard interactivo con emojis automáticos
//   git cz       → equivalente al comando anterior
//
// =============================================================================