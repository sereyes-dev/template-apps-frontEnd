// =============================================================================
// lint-staged.config.mjs — Configuración de lint-staged
// =============================================================================
//
// 📦 Versiones: Husky 9.x · lint-staged latest
// 🛠  Stack:    Next.js 16 · TypeScript · ESLint · Prettier · Stylelint · Bun
//
// ¿Qué hace este sistema?
//   Husky intercepta git hooks (pre-commit, commit-msg, pre-push) y ejecuta
//   scripts automáticamente. lint-staged se encarga de correr las herramientas
//   SOLO sobre los archivos que están en el staging area (git add), no sobre
//   todo el proyecto. Esto hace los hooks rápidos incluso en proyectos grandes.
//
// ¿Por qué es importante en equipos?
//   Garantiza que NADIE puede hacer commit de código que no pase el linter,
//   no esté formateado, o rompa el tipado. Elimina discusiones de code review
//   sobre estilo y formato, enfocando el review en lógica y arquitectura.
//
// Setup inicial (ejecutar una sola vez):
//   bun add -d husky lint-staged
//   bunx husky init
//
// Esto crea la carpeta .husky/ con los archivos de hooks.
// Luego configura cada hook según las instrucciones al final de este archivo.
// =============================================================================

/** @type {import('lint-staged').Config} */
const config = {
  // ---------------------------------------------------------------------------
  // ARCHIVOS TYPESCRIPT Y JAVASCRIPT (componentes, lógica, utilidades)
  // ---------------------------------------------------------------------------

  'app/**/*.{ts,tsx}': [
    // 1. Formatea con Prettier PRIMERO.
    //    Prettier debe ir antes de ESLint para que ESLint no reporte
    //    errores de formato que Prettier acaba de arreglar.
    'prettier --write',

    // 2. Verifica tipos con TypeScript.
    //    El flag --noEmit evita generar archivos de salida (solo verifica tipos).
    //    El flag --skipLibCheck acelera la verificación ignorando node_modules.
    //
    //    Nota: tsc verifica TODO el proyecto, no solo los archivos en staging.
    //    Esto es intencional: un cambio en un archivo puede romper tipos en otro.
    //    Si la verificación es muy lenta, considera moverla al hook pre-push.
    //
    //    Alternativa: usar el plugin de TypeScript de ESLint para type-checking
    //    más granular (solo archivos modificados), pero es más complejo de configurar.
    () => 'tsc -p tsconfig.json --noEmit --skipLibCheck',

    // 3. Aplica ESLint con autofix.
    //    --fix corrige automáticamente las reglas que lo permiten.
    //    --max-warnings 0 hace que cualquier warning sea tratado como error
    //    en el commit, forzando resolución proactiva de warnings.
    //
    //    Alternativa menos estricta: omitir --max-warnings para permitir warnings.
    //    Útil durante la migración de un proyecto existente a ESLint.
    'eslint --fix --max-warnings 0'
  ],

  'app/**/*.{js,jsx,mjs,cjs}': [
    // Para archivos JS puros (configs, scripts) solo Prettier y ESLint.
    // No hay verificación de tipos porque no son TypeScript.
    'prettier --write',
    'eslint --fix --max-warnings 0'
  ],

  // ---------------------------------------------------------------------------
  // ARCHIVOS CSS
  // ---------------------------------------------------------------------------

  '**/*.css': [
    // 1. Stylelint corrige errores de CSS automáticamente.
    //    --fix aplica las correcciones que Stylelint puede automatizar.
    //    --max-warnings 0 = ningún warning permitido en el commit.
    //
    //    Alternativa: omitir --max-warnings 0 durante la migración inicial
    //    si el proyecto tiene muchos archivos CSS preexistentes.
    'stylelint --fix --max-warnings 0',

    // 2. Prettier formatea el CSS (espaciado, orden de valores, etc.).
    //    Va después de Stylelint para no perder las correcciones de Stylelint.
    'prettier --write'
  ],

  // ⚠️  DESCOMENTA si usas SCSS:
  // '**/*.scss': [
  //   'stylelint --fix --max-warnings 0 --config stylelint.config.scss.mjs',
  //   'prettier --write',
  // ],

  // ---------------------------------------------------------------------------
  // ARCHIVOS DE MARKUP Y CONFIGURACIÓN
  // ---------------------------------------------------------------------------

  '**/*.{json,jsonc}': [
    // Prettier formatea JSON: indentación, orden de keys (con plugin), trailing commas.
    // No hay linter para JSON (los errores de sintaxis los detecta el editor/build).
    'prettier --write'
  ],

  '**/*.{md,mdx}': [
    // Prettier formatea Markdown: saltos de línea, espaciado, listas.
    // Útil para mantener documentación consistente en equipos.
    'prettier --write'
  ],

  '**/*.{yml,yaml}': [
    // Formatea archivos YAML (GitHub Actions workflows, Docker compose, etc.).
    'prettier --write'
  ],

  // ---------------------------------------------------------------------------
  // ARCHIVOS ESPECIALES
  // ---------------------------------------------------------------------------

  'package.json': [
    // Solo formatear el package.json.
    // Si usas prettier-plugin-packagejson, esto también ordenará las keys.
    'prettier --write'
  ]
};

export default config;

// =============================================================================
// CONFIGURACIÓN DE LOS HOOKS DE HUSKY
// =============================================================================
//
// Después de correr `bunx husky init`, configura estos archivos:
//
// .husky/pre-commit (verifica código antes de cada commit):
// -------------------------------------------------------
//   #!/bin/sh
//   bunx lint-staged
//
// .husky/commit-msg (verifica el formato del mensaje de commit):
// --------------------------------------------------------------
//   #!/bin/sh
//   bunx commitlint --edit "$1"
//
//   Requiere: bun add -d @commitlint/cli @commitlint/config-conventional
//   Y crear commitlint.config.mjs (ver sección de opciones adicionales).
//
// .husky/pre-push (verifica antes de hacer push, más lento pero más completo):
// ----------------------------------------------------------------------------
//   #!/bin/sh
//   bun run test:ci && bun run build
//
//   Corre todos los tests (no solo los de archivos modificados) y el build.
//   Detecta problemas que lint-staged no puede detectar (tests de integración).
//
// =============================================================================

// =============================================================================
// 🔧 OPCIONES ADICIONALES NO INCLUIDAS (pero útiles según el caso):
//
// commitlint — Conventional Commits
//   Fuerza un formato estándar para los mensajes de commit:
//   feat: agrega nueva funcionalidad
//   fix: corrige un bug
//   docs: actualiza documentación
//   chore: cambios de configuración/build
//   test: agrega o modifica tests
//
//   Beneficios: generación automática de CHANGELOG, versionado semántico automático.
//   bun add -d @commitlint/cli @commitlint/config-conventional
//
//   commitlint.config.mjs:
//   export default {
//     extends: ['@commitlint/config-conventional'],
//     rules: {
//       'type-enum': [2, 'always', ['feat','fix','docs','style','refactor','test','chore','ci']],
//       'subject-max-length': [2, 'always', 100],
//     }
//   }
//
// standard-version o release-it
//   Automatiza el versionado semántico y generación de CHANGELOG
//   basándose en los conventional commits.
//   bun add -d standard-version
//
// secretlint
//   Detecta secretos (API keys, tokens, contraseñas) antes de que lleguen al repo.
//   bun add -d secretlint @secretlint/secretlint-rule-preset-recommend
//   Agregar al pre-commit: 'secretlint **/*'
//
// cspell (spell checker)
//   Verifica ortografía en código y comentarios.
//   Muy útil para proyectos con documentación extensa o equipos internacionales.
//   bun add -d cspell
// =============================================================================
