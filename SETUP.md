# ⚙️ Configuración del Stack de Desarrollo

Stack completo para **Next.js 16 + TypeScript + Bun**.

---

## 📦 Herramientas y versiones

| Herramienta          | Versión | Propósito                        |
| -------------------- | ------- | -------------------------------- |
| Next.js              | 16.x    | Framework                        |
| TypeScript           | 5.7+    | Tipado estático                  |
| ESLint               | 9.x     | Linting de JS/TS                 |
| Prettier             | 3.x     | Formateo de código               |
| Stylelint            | 17.3.0  | Linting de CSS/Tailwind          |
| Vitest               | 4.x     | Unit & integration tests         |
| MSW                  | 2.x     | Mocking de red en tests          |
| Playwright           | 1.52+   | Tests E2E                        |
| @axe-core/playwright | latest  | Accesibilidad E2E (WCAG)         |
| Husky                | 9.x     | Git hooks                        |
| lint-staged          | 15.x    | Lint en archivos staged          |
| commitlint           | 20.x    | Validación de mensajes de commit |
| cz-git + czg         | 1.12.x  | Wizard interactivo de commits    |

---

## 🗺️ Flujo de instalación

> **Orden importante:** instalar y verificar cada herramienta antes de conectarla a Husky. Husky siempre va al final.

### 1. Crear el proyecto

```bash
bun create next-app@latest mi-proyecto
cd mi-proyecto
```

### 2. ESLint

```bash
bun add -d eslint@^9 eslint-config-next eslint-config-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-plugin-sonarjs eslint-plugin-unicorn eslint-plugin-security eslint-plugin-testing-library eslint-plugin-vitest
```

Copiar `eslint.config.mjs` a la raíz.

> ⚠️ Usar `eslint@^9` explícitamente. ESLint 10 rompe los plugins actuales.

### 3. Prettier

```bash
bun add -d prettier prettier-plugin-tailwindcss prettier-plugin-organize-imports @prettier/plugin-xml prettier-plugin-packagejson
```

Copiar `prettier.config.mjs` a la raíz.

> ⚠️ Tailwind v4: usar `tailwindStylesheet: './app/globals.css'` en lugar de `tailwindConfig`.

### 4. Stylelint

```bash
bun add -d stylelint stylelint-config-standard stylelint-config-tailwindcss stylelint-config-css-modules stylelint-order @double-great/stylelint-a11y
```

Copiar `stylelint.config.mjs` a la raíz.

> ⚠️ Usar `@double-great/stylelint-a11y`, NO `stylelint-a11y` (abandonado, incompatible con Stylelint 16+).

### 5. Vitest + Testing Library + MSW

```bash
bun add -d vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom vite-tsconfig-paths @vitest/coverage-v8 @vitest/ui msw vitest-axe axe-core
```

Copiar a sus rutas:

```
vitest.config.mts           → raíz
src/tests/setup.ts          → setup global
src/mocks/node.ts           → servidor MSW
src/mocks/handlers.ts       → handlers de red
```

### 6. Playwright

```bash
bun add -d @playwright/test @axe-core/playwright
bunx playwright install
bunx playwright install --with-deps   # solo en CI / Linux
```

Copiar a sus rutas:

```
playwright.config.ts                  → raíz
e2e/auth/global.setup.ts              → setup de autenticación
e2e/fixtures/axe.fixture.ts           → fixture de accesibilidad E2E
```

Agregar a `.gitignore`:

```
playwright/.auth/
playwright-report/
test-results/
```

### 7. Commitlint + cz-git

```bash
bun add -d @commitlint/cli @commitlint/config-conventional cz-git czg
```

Copiar a sus rutas:
commitlint.config.mjs

> ⚠️ NO instalar `commitizen`. Es incompatible con versiones modernas (`stripAnsi is not a function`). Usar `czg` como CLI standalone.

### 8. Husky + lint-staged

```bash
bun add -d husky lint-staged
bunx husky init
```

Copiar a sus rutas:

````
lint-staged.config.mjs

Crear los hooks:

**`.husky/pre-commit`:**
```sh
#!/bin/sh
node node_modules/lint-staged/bin/lint-staged.js --config lint-staged.config.frontend.mjs
````

**`.husky/commit-msg`:**

```sh
#!/bin/sh
bunx commitlint --edit "$1" --config commitlint.config.mjs
```

**`.husky/pre-push`:**

```sh
#!/bin/sh
bun run typecheck
```

```bash
chmod +x .husky/pre-commit .husky/commit-msg .husky/prepare-commit-msg .husky/pre-push
```

> ⚠️ Windows: usar `node node_modules/lint-staged/bin/lint-staged.js` en lugar de `bunx lint-staged` para evitar ventanas de terminal emergentes.

---

## 📁 Estructura final

```
mi-proyecto/
├── .husky/
│   ├── pre-commit               ← lint-staged
│   ├── commit-msg               ← commitlint
│   ├── prepare-commit-msg       ← czg wizard
│   └── pre-push                 ← typecheck
├── e2e/
│   ├── auth/global.setup.ts     ← storageState de Playwright
│   ├── fixtures/axe.fixture.ts  ← fixture de accesibilidad E2E
│   └── __screenshots__/         ← baselines visuales ✅ commitear
├── playwright/.auth/            ← sesiones de test ⛔ NO commitear
├── src/
│   ├── mocks/
│   │   ├── node.ts              ← servidor MSW
│   │   └── handlers.ts          ← handlers mockeados
│   └── tests/
│       └── setup.ts             ← setup global de Vitest
├── commitlint.config.frontend.mjs
├── eslint.config.mjs
├── lint-staged.config.frontend.mjs
├── playwright.config.ts
├── prettier.config.mjs
├── stylelint.config.mjs
└── vitest.config.mts
```

---

## 🔁 Scripts en `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",

    "prepare": "husky",
    "cm": "czg",

    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "lint:css": "stylelint \"**/*.css\" --config stylelint.config.mjs",
    "lint:css:fix": "stylelint \"**/*.css\" --config stylelint.config.mjs --fix",

    "format": "prettier --write .",
    "format:check": "prettier --check .",

    "typecheck": "tsc --noEmit",

    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:visual": "playwright test --project=visual",
    "test:e2e:report": "playwright show-report",

    "check:lint": "bun run lint && bun run lint:css && bun run format:check",
    "check:types": "bun run typecheck",
    "check:tests": "bun run test:run",
    "check": "bun run check:types && bun run check:lint && bun run check:tests"
  },
  "config": {
    "commitizen": {
      "path": "node_modules/cz-git"
    }
  }
}
```

### Referencia de scripts

| Script                    | Cuándo usarlo                                 |
| ------------------------- | --------------------------------------------- |
| `bun run cm`              | Abrir el wizard interactivo de commits        |
| `bun run lint`            | Verificar JS/TS con ESLint                    |
| `bun run lint:fix`        | Corregir automáticamente errores de ESLint    |
| `bun run lint:css`        | Verificar CSS con Stylelint                   |
| `bun run lint:css:fix`    | Corregir automáticamente errores de Stylelint |
| `bun run format`          | Formatear todos los archivos con Prettier     |
| `bun run format:check`    | Verificar formato sin modificar archivos      |
| `bun run typecheck`       | Verificar tipos de TypeScript                 |
| `bun run test`            | Tests en modo watch (desarrollo)              |
| `bun run test:run`        | Tests una sola vez (CI / pre-push)            |
| `bun run test:ui`         | Interfaz visual de Vitest en el browser       |
| `bun run test:coverage`   | Tests con reporte de cobertura                |
| `bun run test:e2e`        | Tests E2E con Playwright (todos los browsers) |
| `bun run test:e2e:visual` | Solo tests de regresión visual                |
| `bun run check:lint`      | ESLint + Stylelint + Prettier en un comando   |
| `bun run check:types`     | Solo TypeScript                               |
| `bun run check:tests`     | Solo tests unitarios                          |
| `bun run check`           | ✅ Todo: tipos + lint + tests (ideal para CI) |

---

## 🔄 Flujo completo de un commit

```
git add .
bun run cm
    ↓
[prepare-commit-msg] czg abre el wizard
    → elegir type con emoji automático (feat ✨, fix 🐛, refactor ♻️...)
    → elegir scope con autocompletado
    → escribir descripción
    → confirmar
    ↓
[pre-commit] lint-staged sobre archivos staged
    → Prettier formatea
    → ESLint corrige JS/TS
    → Stylelint corrige CSS
    ↓
[commit-msg] commitlint valida el mensaje de czg
    → verifica type, scope, subject, longitud
    ↓
✅ commit guardado
```

---

## ⚠️ Problemas conocidos y soluciones

| Problema                                       | Causa                                       | Solución                                                           |
| ---------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| `stripAnsi is not a function`                  | `commitizen` incompatible con deps modernas | Desinstalar `commitizen`, usar `czg` directamente                  |
| `bun: command not found: czg`                  | `czg` es un paquete separado de `cz-git`    | `bun add -d czg`                                                   |
| `Cannot find module 'isStandardSyntaxRule'`    | `stylelint-a11y` abandonado                 | Usar `@double-great/stylelint-a11y`                                |
| `Cannot find module 'tailwind.config.ts'`      | Tailwind v4 eliminó el config file          | `tailwindStylesheet: './app/globals.css'` en `prettier.config.mjs` |
| Ventanas emergentes en Windows al hacer commit | Bun usa `cmd.exe` para subprocesos          | Usar `node node_modules/lint-staged/bin/lint-staged.js` en el hook |
| `eslint: Class extends value undefined`        | ESLint 10 incompatible con plugins          | Usar `eslint@^9` explícitamente                                    |
| `No configuration provided` en Stylelint       | Config no encontrado por nombre             | Pasar `--config stylelint.config.mjs` en los scripts               |
| `Invalid Option: --shell` en lint-staged       | Flag inexistente en lint-staged             | Quitar `--shell`, no es una opción válida                          |
