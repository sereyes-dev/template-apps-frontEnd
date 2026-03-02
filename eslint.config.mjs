// =============================================================================
// eslint.config.mjs — Configuración de ESLint (Flat Config)
// =============================================================================
//
// 📦 Versión: ESLint 9.x con Flat Config (formato estándar desde ESLint 9)
// 🛠  Stack:  Next.js 16 · TypeScript 5.7+ · Prettier 3.x · React 19
//
// ¿Por qué Flat Config y no .eslintrc?
//   ESLint 9 deprecó el formato .eslintrc. El nuevo formato "flat config"
//   (eslint.config.mjs) es más explícito, predecible y sin herencia oculta.
//   Es el estándar para todos los proyectos nuevos.
//
// Dependencias base:
//   bun add -d eslint eslint-config-next eslint-config-prettier
//             @typescript-eslint/eslint-plugin @typescript-eslint/parser
//             eslint-plugin-react eslint-plugin-react-hooks
//             eslint-plugin-jsx-a11y eslint-plugin-import
//
// Dependencias de plugins adicionales (NUEVAS — ver comando completo al final):
//   bun add -d eslint-plugin-sonarjs eslint-plugin-unicorn
//             eslint-plugin-security eslint-plugin-testing-library
//             eslint-plugin-vitest
// =============================================================================

import { defineConfig, globalIgnores } from 'eslint/config';

// eslint-config-next/core-web-vitals incluye reglas específicas de Next.js:
//   - next/no-html-link-for-pages: evita <a> en lugar de <Link>
//   - next/no-img-element: fuerza uso de <Image> de next/image
//   - next/google-font-display: advierte sobre font-display en Google Fonts
//   - Core Web Vitals: reglas que afectan LCP, FID y CLS
//
// Alternativa: 'eslint-config-next' (sin core-web-vitals) es más permisiva
// y omite las reglas que impactan métricas de rendimiento. Útil si el proyecto
// no es público o no se miden Core Web Vitals.
import nextVitals from 'eslint-config-next/core-web-vitals';

// eslint-config-prettier DESACTIVA todas las reglas de ESLint que pueden
// entrar en conflicto con Prettier (espaciado, punto y coma, comillas, etc.)
// SIEMPRE debe ir al final del array para que sobreescriba correctamente.
import prettier from 'eslint-config-prettier/flat';

// -----------------------------------------------------------------------------
// PLUGINS ADICIONALES HABILITADOS
// -----------------------------------------------------------------------------

// eslint-plugin-sonarjs detecta code smells y bugs potenciales:
//   - Funciones duplicadas, bloques de código idénticos
//   - Alta complejidad cognitiva (funciones difíciles de entender)
//   - Variables usadas antes de ser asignadas
//   - Condiciones siempre verdaderas o falsas
//   - Retornos inconsistentes en funciones
// Referencia: https://github.com/SonarSource/eslint-plugin-sonarjs
import sonarjs from 'eslint-plugin-sonarjs';

// eslint-plugin-unicorn impone buenas prácticas modernas de JavaScript:
//   - Uso de APIs nativas más expresivas (Array.from, Object.entries, etc.)
//   - Naming conventions consistentes (camelCase, PascalCase, UPPER_CASE)
//   - Evitar patrones obsoletos o confusos del lenguaje
//   - Manejo correcto de errores (throw new Error vs throw 'string')
// Referencia: https://github.com/sindresorhus/eslint-plugin-unicorn
import unicorn from 'eslint-plugin-unicorn';

// eslint-plugin-security detecta vulnerabilidades comunes en Node.js y JS:
//   - Uso de eval() y Function() dinámicos
//   - Regex con posible ReDoS (expresiones regulares de backtracking exponencial)
//   - Acceso dinámico a propiedades con input del usuario (object[userInput])
//   - Uso de require() con rutas dinámicas
//   - Escritura de archivos sin validar la ruta
// Referencia: https://github.com/eslint-community/eslint-plugin-security
import security from 'eslint-plugin-security';

// eslint-plugin-testing-library aplica las mejores prácticas de Testing Library:
//   - Prohíbe el uso de getByTestId cuando hay mejores selectores de a11y
//   - Fuerza el uso de userEvent sobre fireEvent cuando sea posible
//   - Evita esperar por elementos con await dentro de queries síncronas
//   - Detecta renders y cleanup incorrectos
// Referencia: https://github.com/testing-library/eslint-plugin-testing-library
import testingLibrary from 'eslint-plugin-testing-library';

// eslint-plugin-vitest aplica las mejores prácticas específicas de Vitest:
//   - Detecta tests sin aserciones (it blocks vacíos o sin expect)
//   - Avisa sobre describe/it anidados incorrectamente
//   - Detecta uso de .only y .skip que podrían quedarse por error
//   - Fuerza el uso correcto de vi.mock, vi.fn, vi.spyOn
// Referencia: https://github.com/vitest-dev/eslint-plugin-vitest
import vitestPlugin from 'eslint-plugin-vitest';

export default defineConfig([
  // ---------------------------------------------------------------------------
  // 1. Configuración base de Next.js + Core Web Vitals
  //    Incluye: @typescript-eslint, react, react-hooks, jsx-a11y, import
  // ---------------------------------------------------------------------------
  ...nextVitals,

  // ---------------------------------------------------------------------------
  // 2. SonarJS — Detección de code smells y bugs potenciales
  //    Se aplica a todo el código fuente (JS y TS), no a los tests.
  //    Los tests tienen su propia sección con configuración adaptada.
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    // sonarjs.configs.recommended activa todas las reglas recomendadas.
    // Alternativa: sonarjs.configs.all para el conjunto completo (muy estricto).
    ...sonarjs.configs.recommended,
    rules: {
      ...sonarjs.configs.recommended.rules,

      // ✅ Límite de complejidad cognitiva por función.
      //    La complejidad cognitiva mide cuán difícil es de entender una función
      //    (no la complejidad ciclomática clásica). Valor de 15 es el recomendado
      //    por SonarSource para mantener el código legible.
      //
      //    Cómo se calcula: cada if/else/loop/switch/catch suma +1 al contador.
      //    Los anidados suman más. Una función con valor > 15 suele necesitar refactor.
      //
      //    Alternativa: 10 para equipos con estándares más estrictos.
      //    Alternativa: 20 si el proyecto tiene lógica de negocio muy compleja.
      'sonarjs/cognitive-complexity': ['error', 15],

      // ✅ Evita bloques de código duplicados (copy-paste de lógica).
      //    Detecta cuando el mismo bloque de código aparece 3+ veces.
      //    Fuerza la extracción de funciones reutilizables.
      'sonarjs/no-identical-functions': 'error',

      // ✅ Evita condiciones siempre verdaderas o siempre falsas.
      //    Ejemplo: if (true) { } o if (x === x) { } son bugs o código muerto.
      'sonarjs/no-invariant-returns': 'error',

      // ✅ Detecta valores retornados de funciones que nunca se usan.
      //    Ejemplo: arr.map(fn) sin asignar el resultado a una variable.
      'sonarjs/no-ignored-return': 'error',

      // ✅ Evita el uso de console.log con datos sensibles pasándolo como warn.
      //    SonarJS es más inteligente que la regla no-console básica de ESLint.
      //    Complementa (no reemplaza) la regla no-console definida abajo (Está en off porque la opción no se encuentra     disponible en este momento).
      'sonarjs/no-console-log': 'off'
    }
  },

  // ---------------------------------------------------------------------------
  // 3. Security — Detección de vulnerabilidades en código JS/TS
  //    Especialmente relevante para el código que interactúa con APIs y usuarios.
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...security.configs.recommended,
    rules: {
      ...security.configs.recommended.rules,

      // ✅ Detecta el uso de eval() y new Function() con strings dinámicos.
      //    Son vectores de inyección de código. Nunca deben usarse con input externo.
      'security/detect-eval-with-expression': 'error',

      // ✅ Detecta regex con posible ReDoS (backtracking exponencial).
      //    Un regex mal construido puede hacer que el servidor deje de responder
      //    si un atacante envía un string especialmente diseñado.
      'security/detect-unsafe-regex': 'error',

      // ✅ Detecta require() con rutas dinámicas construidas con variables.
      //    Puede ser un vector de path traversal si la variable viene del usuario.
      'security/detect-non-literal-require': 'error',

      // ✅ Detecta uso de fs con rutas no literales (posible path traversal).
      'security/detect-non-literal-fs-filename': 'warn',

      // ⚠️ DESACTIVADO INTENCIONALMENTE: object[variable] no siempre es un riesgo.
      //    En Next.js es muy común acceder a propiedades con variables en componentes
      //    y utilities. El falso positivo haría el linting muy ruidoso.
      //    Activar solo si el proyecto maneja inputs del usuario directamente en
      //    accesos a propiedades de objetos críticos.
      'security/detect-object-injection': 'off',

      // ⚠️ DESACTIVADO: los pseudo-random numbers son suficientes para UI.
      //    Activar solo si el proyecto genera tokens, IDs de sesión o valores
      //    criptográficamente sensibles en el frontend.
      'security/detect-pseudorandom-bytes': 'off'
    }
  },

  // ---------------------------------------------------------------------------
  // 4. Unicorn — Buenas prácticas modernas de JavaScript
  //    Se configura de forma selectiva: no todas las reglas de unicorn son
  //    compatibles con el estilo de un proyecto Next.js/React.
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { unicorn },
    rules: {
      // =========================================================================
      // NAMING CONVENTIONS
      // =========================================================================

      // ✅ Fuerza kebab-case en nombres de archivos.
      //    Ejemplo: user-profile.tsx en vez de UserProfile.tsx o userProfile.tsx.
      //    Mejora la consistencia en sistemas de archivos case-insensitive (macOS/Windows).
      //
      //    ⚠️ En Next.js App Router, los archivos de página deben llamarse page.tsx,
      //    layout.tsx, etc. (ya son kebab-case). Los componentes en /components/
      //    suelen usar PascalCase como convención de React.
      //
      //    Alternativa: desactivar ('off') si el equipo prefiere PascalCase para componentes.
      'unicorn/filename-case': [
        'warn',
        {
          cases: {
            kebabCase: true, // user-profile.tsx ✅
            pascalCase: true // UserProfile.tsx ✅ (convención de componentes React)
          },
          ignore: [
            // Next.js App Router: archivos especiales con nombres fijos
            /^page\.(tsx|ts|jsx|js)$/,
            /^layout\.(tsx|ts|jsx|js)$/,
            /^loading\.(tsx|ts|jsx|js)$/,
            /^error\.(tsx|ts|jsx|js)$/,
            /^not-found\.(tsx|ts|jsx|js)$/,
            /^route\.(tsx|ts|jsx|js)$/,
            /^middleware\.(tsx|ts|jsx|js)$/,
            // Configuraciones en la raíz del proyecto
            /^[A-Z].+\.(ts|js|mjs|cjs)$/
          ]
        }
      ],

      // =========================================================================
      // APIS MODERNAS Y EXPRESIVIDAD
      // =========================================================================

      // ✅ Prefiere Array.from() sobre el spread [...] en conversiones.
      //    Array.from(nodeList) es más explícito que [...nodeList].
      //    Alternativa: 'off' si el equipo prefiere la sintaxis de spread.
      'unicorn/prefer-array-from': 'off',

      // ✅ Prefiere Array.includes() sobre indexOf !== -1.
      //    array.includes(x) es más legible que array.indexOf(x) !== -1.
      'unicorn/prefer-includes': 'error',

      // ✅ Prefiere String.startsWith/endsWith sobre regex o slice comparisons.
      //    str.startsWith('prefix') es más claro que /^prefix/.test(str).
      'unicorn/prefer-string-starts-ends-with': 'error',

      // ✅ Prefiere el operador de exponenciación ** sobre Math.pow().
      //    2 ** 10 es más legible que Math.pow(2, 10) Desactivada porque no está la función.
      'unicorn/prefer-exponentiation-operator': 'off',

      // ✅ Prefiere Object.fromEntries() para reconstruir objetos desde arrays.
      //    Object.fromEntries(entries) sobre reduce para construir objetos.
      'unicorn/prefer-object-from-entries': 'error',

      // ✅ Fuerza throw new Error() en vez de throw 'string'.
      //    Los Error objects tienen stack trace; los strings no.
      //    Crítico para debugging y logging de errores.
      'unicorn/throw-new-error': 'error',

      // ✅ Evita el uso de `new Array(n)` para crear arrays.
      //    Array.from({ length: n }) es más predecible y sin edge cases.
      'unicorn/no-new-array': 'error',

      // ✅ Detecta errores de instanciación de Error sin mensaje.
      //    throw new Error() sin mensaje hace el debugging muy difícil.
      'unicorn/error-message': 'error',

      // ✅ Prefiere ternario sobre if-else de una sola línea cuando asigna.
      //    const x = condition ? a : b en vez de let x; if (...) x = a; else x = b;
      'unicorn/prefer-ternary': 'warn',

      // =========================================================================
      // REGLAS DESACTIVADAS (conflictos con el ecosistema Next.js/React)
      // =========================================================================

      // ❌ DESACTIVADO: unicorn fuerza import desde el path más específico,
      //    pero Next.js y muchos paquetes de React usan barrel files (index.ts).
      'unicorn/no-array-for-each': 'off',

      // ❌ DESACTIVADO: abreviaciones son comunes y aceptadas en el ecosistema JS.
      //    Unicorn prohíbe nombres como 'e', 'err', 'res', 'req' que son estándar.
      'unicorn/prevent-abbreviations': 'off',

      // ❌ DESACTIVADO: null es ampliamente usado en React (refs, estados iniciales).
      //    Unicorn prefiere undefined sobre null, pero React y muchas librerías usan null.
      'unicorn/no-null': 'off',

      // ❌ DESACTIVADO: Next.js usa estructuras de archivo con index.ts/index.tsx.
      'unicorn/prefer-module': 'off'
    }
  },

  // ---------------------------------------------------------------------------
  // 5. Reglas personalizadas para TypeScript
  //    Refuerzan buenas prácticas que eslint-config-next no activa por defecto
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // ✅ Obliga a tipar explícitamente el retorno de funciones públicas.
      //    Útil en equipos para mantener contratos claros.
      //    Opción alternativa: 'warn' si el equipo está migrando a TS gradualmente.
      '@typescript-eslint/explicit-function-return-type': 'error', // off para no ser restrictivo al inicio

      // ✅ Evita el uso de `any` explícito. En equipos, `any` es una deuda técnica.
      //    Alternativa: 'warn' para proyectos legacy que migran de JS a TS.
      '@typescript-eslint/no-explicit-any': 'warn',

      // ✅ Fuerza el uso de `import type` cuando solo se importan tipos.
      //    Mejora el tree-shaking y deja claro qué es valor y qué es tipo.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
      ],

      // ✅ Evita variables declaradas pero no usadas.
      //    La variante de @typescript-eslint reemplaza la regla base de ESLint
      //    para manejar correctamente parámetros de tipo genérico.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_', // ignora parámetros con prefijo _
          varsIgnorePattern: '^_', // ignora variables con prefijo _
          caughtErrorsIgnorePattern: '^_' // ignora errores con prefijo _
        }
      ]
    }
  },

  // ---------------------------------------------------------------------------
  // 6. Reglas para React y componentes
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      // ✅ En React 17+ el nuevo JSX transform no requiere importar React.
      //    Desactiva la regla que lo exigía en versiones anteriores.
      'react/react-in-jsx-scope': 'off',

      // ✅ Desactiva la validación de PropTypes porque usamos TypeScript.
      //    Si el proyecto usara JS puro, esta regla debería estar en 'error'.
      'react/prop-types': 'off',

      // ✅ Fuerza self-closing en componentes sin hijos: <Component /> en vez de <Component></Component>
      //    Mejora la legibilidad, especialmente en revisiones de código en equipo.
      'react/self-closing-comp': 'error',

      // ✅ Las dependencias de hooks deben ser completas para evitar stale closures.
      //    Una de las reglas más importantes al trabajar con useEffect/useCallback.
      'react-hooks/exhaustive-deps': 'warn'
    }
  },

  // ---------------------------------------------------------------------------
  // 7. Reglas generales de buenas prácticas (JS/TS)
  // ---------------------------------------------------------------------------
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // ✅ Evita console.log en producción. En desarrollo se permite con warn.
      //    Alternativa para equipos más estrictos: 'error' + usar un logger dedicado.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // ✅ Evita código inalcanzable después de return/throw/break/continue.
      'no-unreachable': 'error',

      // ✅ Fuerza el uso de === en vez de == para evitar coerciones de tipo.
      eqeqeq: ['error', 'always'],

      // ✅ Evita el uso de var, fuerza let/const.
      'no-var': 'error',

      // ✅ Prefiere const cuando la variable no se reasigna.
      'prefer-const': 'error',

      // ✅ Fuerza el uso de template literals en vez de concatenación con +.
      //    Mejora legibilidad especialmente en strings multilinea.
      'prefer-template': 'warn'
    }
  },

  // ---------------------------------------------------------------------------
  // 8. Archivos de configuración: reglas más permisivas
  //    Los archivos .config.* suelen necesitar require() o console.log
  // ---------------------------------------------------------------------------
  {
    files: ['*.config.{js,ts,mjs,cjs}', '*.config.*.{js,ts,mjs,cjs}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  },

  // ---------------------------------------------------------------------------
  // 9. Archivos de tests: Testing Library + Vitest
  //    Combina las reglas de ambos plugins para tests de componentes y unitarios.
  // ---------------------------------------------------------------------------
  {
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/__tests__/**/*.{ts,tsx}',
      'e2e/**/*.{ts,tsx}'
    ],

    // Configuración base de Vitest: activa el entorno global de Vitest
    // para que ESLint reconozca describe, it, expect, vi, etc.
    ...vitestPlugin.configs.recommended,

    plugins: {
      // Registra ambos plugins para poder usar sus reglas en este bloque.
      vitest: vitestPlugin,
      'testing-library': testingLibrary
    },

    rules: {
      // Hereda las reglas recomendadas de Vitest
      ...vitestPlugin.configs.recommended.rules,

      // =======================================================================
      // VITEST — Calidad y correctitud de los tests
      // =======================================================================

      // ✅ Detecta tests sin ninguna aserción (expect).
      //    Un test sin expect siempre pasa y no verifica nada. Es un falso positivo.
      //    min: 1 exige al menos una aserción por test.
      'vitest/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expectTypeOf'] }
      ],

      // ✅ Detecta bloques describe/it/test vacíos.
      //    Un test vacío no verifica nada y solo genera ruido en los reportes.
      'vitest/no-disabled-tests': 'error',

      // ✅ Detecta .only() que hayan quedado por accidente.
      //    it.only() en un commit hace que solo ese test corra en CI.
      'vitest/no-focused-tests': 'error',

      // ✅ Detecta tests duplicados (mismo título en el mismo describe).
      //    Los títulos duplicados generan confusión en los reportes de CI.
      'vitest/no-identical-title': 'error',

      // ✅ Fuerza el uso de expect().rejects para testear Promises rechazadas.
      //    Evita el patrón catch + fail que puede dejar pasar errores.
      'vitest/no-standalone-expect': 'error',

      // ✅ Detecta el uso de await en expresiones no asíncronas.
      //    Ejemplo: await expect(value).toBe(x) cuando value no es una Promise.
      'vitest/valid-expect': ['error', { alwaysAwait: false }],

      // ✅ Fuerza describe/it/test a ser funciones (no arrow functions con this).
      //    Consistencia con la API de Vitest.
      'vitest/consistent-test-it': ['warn', { fn: 'it', withinDescribe: 'it' }],

      // =======================================================================
      // TESTING LIBRARY — Mejores prácticas de queries y aserciones
      // =======================================================================

      // ✅ Prohíbe el uso de getByTestId como primera opción de query.
      //    getByRole, getByLabelText, getByText son más robustos y accesibles.
      //    data-testid debe ser el último recurso cuando no hay otra opción.
      'testing-library/no-node-access': 'error',

      // ✅ Evita el uso de container.querySelector() directamente.
      //    Las queries de Testing Library (getByRole, etc.) son más semánticas.
      'testing-library/no-container': 'error',

      // ✅ Detecta render() sin cleanup posterior.
      //    Testing Library hace cleanup automático con afterEach si está configurado,
      //    pero esta regla detecta casos donde se llama manual e incorrectamente.
      'testing-library/no-render-in-lifecycle': 'error',

      // ✅ Detecta el uso de act() innecesario (Testing Library lo maneja internamente).
      //    Envolver todo en act() manualmente es un antipatrón que genera ruido.
      'testing-library/no-unnecessary-act': 'warn',

      // ✅ Fuerza el uso de userEvent sobre fireEvent cuando el evento lo permite.
      //    userEvent simula comportamiento real del usuario (focus, keydown, etc.).
      //    fireEvent solo dispara el evento sin el comportamiento completo del browser.
      'testing-library/prefer-user-event': 'warn',

      // ✅ Detecta consultas de find* sin await.
      //    findBy* es asíncrono y siempre debe usarse con await.
      //    Sin await, el test podría pasar antes de que el elemento aparezca.
      'testing-library/await-async-queries': 'error',

      // ✅ Prohíbe debug() en el código commiteado.
      //    screen.debug() es solo para desarrollo local; no debe llegar al repo.
      'testing-library/no-debugging-utils': 'warn',

      // =======================================================================
      // REGLAS RELAJADAS EN TESTS (igual que antes)
      // =======================================================================

      // En tests es común usar `any` para mocks y stubs.
      '@typescript-eslint/no-explicit-any': 'off',
      // Los tests suelen tener console para debugging temporal.
      'no-console': 'warn',
      // SonarJS y Security son menos relevantes en tests.
      'sonarjs/cognitive-complexity': 'off',
      'security/detect-object-injection': 'off',
      // Unicorn puede ser demasiado estricto en archivos de test.
      'unicorn/filename-case': 'off'
    }
  },

  // ---------------------------------------------------------------------------
  // 10. Archivos y carpetas a ignorar completamente
  //    Prettier desactiva reglas de formato; siempre al final.
  // ---------------------------------------------------------------------------
  globalIgnores([
    '.next/**',
    'out/**',
    'dist/**',
    'build/**',
    'node_modules/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'public/**',
    '*.min.js'
  ]),

  // ---------------------------------------------------------------------------
  // IMPORTANTE: prettier siempre debe ser el último elemento del array.
  //   Desactiva todas las reglas de ESLint relacionadas con formato visual
  //   para dejar esa responsabilidad exclusivamente a Prettier.
  // ---------------------------------------------------------------------------
  prettier
]);

// =============================================================================
// 📦 COMANDO DE INSTALACIÓN DE TODOS LOS PLUGINS
//
// Copia y pega este comando para instalar todas las dependencias de una vez:
//
// bun add -d eslint@^9 eslint-config-next eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-sonarjs eslint-plugin-unicorn eslint-plugin-security eslint-plugin-testing-library eslint-plugin-vitest
//
// =============================================================================
