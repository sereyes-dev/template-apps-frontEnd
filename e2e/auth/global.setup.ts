// =============================================================================
// e2e/auth/global.setup.ts — Setup de autenticación con Storage State
// =============================================================================
//
// Este archivo es el "proyecto setup" de Playwright. Se ejecuta UNA SOLA VEZ
// antes de todos los proyectos de test (chromium, firefox, webkit, visual).
// Su única responsabilidad: hacer login y guardar el estado de sesión.
//
// ¿Por qué Storage State en lugar de login en cada test?
//   Sin Storage State: 50 tests × 5s de login = 250s solo en autenticación.
//   Con Storage State: 1 login × 5s + 50 tests sin login = 5s en total.
//   En suites grandes, esto puede reducir el tiempo de ejecución de 45min a 12min.
//
// ¿Cómo funciona?
//   1. Este setup hace login con las credenciales de test.
//   2. Playwright captura el estado de la sesión: cookies + localStorage.
//   3. Lo guarda en playwright/.auth/user.json (y admin.json si aplica).
//   4. Los proyectos chromium, firefox, webkit carganel storageState al inicio.
//   5. Cada test empieza ya autenticado, sin haber hecho login.
//
// Cuándo se regenera el storageState:
//   - Al correr los tests si playwright/.auth/*.json no existe.
//   - Manualmente: bunx playwright test --project=setup
//   - En CI: siempre (el directorio .auth no se commitea ni cachea entre runs).
//
// ⚠️  SEGURIDAD: agregar a .gitignore:
//     playwright/.auth/
//   Los archivos JSON contienen tokens de sesión activos.
//   Jamás commitear credenciales reales en el repositorio.
//
// Variables de entorno requeridas (en .env.test o en CI secrets):
//   E2E_USER_EMAIL     → email del usuario de test
//   E2E_USER_PASSWORD  → contraseña del usuario de test
//   E2E_ADMIN_EMAIL    → email del admin de test (opcional)
//   E2E_ADMIN_PASSWORD → contraseña del admin de test (opcional)
// =============================================================================

import { STORAGE_STATE } from '@/playwright.config';
import { expect, test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// SETUP: LOGIN DE USUARIO ESTÁNDAR
// ---------------------------------------------------------------------------
//
// Adaptar el flujo de login según la app:
//   - Si usa NextAuth: el formulario de /api/auth/signin
//   - Si usa un formulario propio: /login, /signin, /auth
//   - Si usa API directa: usar request.post() en lugar de page.fill()

setup('authenticate as user', async ({ page }) => {
  // Crear el directorio .auth si no existe.
  // Playwright no lo crea automáticamente.
  const authDir = path.dirname(STORAGE_STATE.user);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Reutilizar sesión existente si el archivo tiene menos de 10 minutos.
  // Evita el login en cada watch run durante el desarrollo local.
  // En CI, el directorio .auth nunca existe, así que siempre hace login.
  if (fs.existsSync(STORAGE_STATE.user)) {
    const stats = fs.statSync(STORAGE_STATE.user);
    const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
    if (ageMinutes < 10) {
      console.log(
        `\t⚡ Reutilizando sesión de usuario (${Math.floor(ageMinutes)}min)`
      );
      return;
    }
  }

  // ── FLUJO DE LOGIN ────────────────────────────────────────────────────────
  //
  // Adaptar según la autenticación de la app:
  //
  // Opción A — Formulario de login estándar (más común):
  await page.goto('/login');
  //
  // Esperar a que el formulario esté completamente cargado y listo.
  // getByRole es más robusto que selectores CSS para campos de formulario.
  await page
    .getByRole('textbox', { name: /email|usuario/i })
    .fill(process.env.E2E_USER_EMAIL ?? 'user@example.com');
  await page
    .getByRole('textbox', { name: /contraseña|password/i })
    .fill(process.env.E2E_USER_PASSWORD ?? 'password123');
  await page
    .getByRole('button', { name: /iniciar sesión|sign in|login/i })
    .click();
  //
  // Esperar a que el login se complete y la sesión esté establecida.
  // Verificar que llegamos a la página correcta después del login.
  // Sin esta verificación, el storageState podría guardarse antes de
  // que las cookies de sesión estén completamente establecidas.
  await page.waitForURL(/dashboard|home|inicio/, { timeout: 10_000 });
  await expect(
    page.getByRole('navigation').or(page.getByTestId('main-nav'))
  ).toBeVisible();

  // ── GUARDAR EL ESTADO DE SESIÓN ───────────────────────────────────────────
  //
  // context.storageState() captura:
  //   - Cookies (incluyendo session cookies y JWT cookies httpOnly)
  //   - localStorage (tokens JWT almacenados en el cliente)
  //   - sessionStorage
  //
  // Todo lo necesario para que los tests empiecen autenticados.
  await page.context().storageState({ path: STORAGE_STATE.user });
  console.log(`\t✅ Sesión de usuario guardada en ${STORAGE_STATE.user}`);

  // ─────────────────────────────────────────────────────────────────────────
  // Opción B — Login via API (más rápido, sin UI):
  // Usar si la app tiene un endpoint de autenticación REST accesible.
  // ─────────────────────────────────────────────────────────────────────────
  //
  // setup('authenticate as user via API', async ({ request }) => {
  //   const response = await request.post('/api/auth/login', {
  //     data: {
  //       email: process.env.E2E_USER_EMAIL,
  //       password: process.env.E2E_USER_PASSWORD,
  //     },
  //   })
  //   expect(response.ok()).toBeTruthy()
  //
  //   // Guardar el estado con las cookies que devuelve la API.
  //   await request.storageState({ path: STORAGE_STATE.user })
  // })
});

// ---------------------------------------------------------------------------
// SETUP: LOGIN DE ADMINISTRADOR (opcional)
// ---------------------------------------------------------------------------
//
// ⚠️  DESCOMENTA si la app tiene un rol admin con acceso a rutas distintas.
//    Requiere agregar E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD a .env.test.
//    Requiere descomentar el proyecto 'chromium-admin' en playwright.config.ts.

// setup('authenticate as admin', async ({ page }) => {
//   const authDir = path.dirname(STORAGE_STATE.admin)
//   if (!fs.existsSync(authDir)) {
//     fs.mkdirSync(authDir, { recursive: true })
//   }
//
//   if (fs.existsSync(STORAGE_STATE.admin)) {
//     const stats = fs.statSync(STORAGE_STATE.admin)
//     const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60
//     if (ageMinutes < 10) {
//       console.log(`\t⚡ Reutilizando sesión de admin (${Math.floor(ageMinutes)}min)`)
//       return
//     }
//   }
//
//   await page.goto('/login')
//   await page.getByRole('textbox', { name: /email/i }).fill(
//     process.env.E2E_ADMIN_EMAIL ?? 'admin@example.com'
//   )
//   await page.getByRole('textbox', { name: /password/i }).fill(
//     process.env.E2E_ADMIN_PASSWORD ?? 'admin123'
//   )
//   await page.getByRole('button', { name: /sign in/i }).click()
//   await page.waitForURL(/admin|dashboard/)
//   await page.context().storageState({ path: STORAGE_STATE.admin })
//   console.log(`\t✅ Sesión de admin guardada en ${STORAGE_STATE.admin}`)
// })
