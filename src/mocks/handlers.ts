// =============================================================================
// src/mocks/handlers.ts — Handlers de MSW (compartidos Node + Browser)
// =============================================================================
//
// Este archivo define los handlers de red que MSW usa para interceptar
// requests en tests (Node.js) y en desarrollo local (browser).
//
// Un handler es una función que:
//   1. Coincide con una URL y un método HTTP (o una operación GraphQL)
//   2. Retorna una respuesta mock en lugar de hacer la request real
//
// Estos handlers representan el "happy path" por defecto: las respuestas
// exitosas que la mayoría de tests esperarán. Para tests de error o edge
// cases, usa server.use() dentro del test para sobrescribir temporalmente:
//
//   it('shows error state', () => {
//     server.use(
//       http.get('/api/users', () => HttpResponse.error())
//     )
//     // el handler temporal solo aplica a este test
//   })
//
// Adaptar este archivo según los endpoints reales del proyecto.
// =============================================================================

import { http, HttpResponse } from 'msw';

export const handlers = [
  // ---------------------------------------------------------------------------
  // EJEMPLO — GET /api/users
  // Retorna una lista de usuarios mockeados.
  // ---------------------------------------------------------------------------
  //
  // Uso en tests:
  //   it('renders user list', async () => {
  //     render(<UserList />)
  //     expect(await screen.findByText('John Doe')).toBeInTheDocument()
  //   })
  //
  // MSW interceptará el fetch('/api/users') del componente y retornará
  // esta respuesta sin hacer una request real al backend.

  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
    ]);
  }),

  // ---------------------------------------------------------------------------
  // EJEMPLO — GET /api/users/:id
  // Retorna un usuario por ID.
  // ---------------------------------------------------------------------------

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;

    // Simular un 404 para IDs no existentes
    if (id === 'not-found') {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      id,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    });
  }),

  // ---------------------------------------------------------------------------
  // EJEMPLO — POST /api/users
  // Crea un nuevo usuario y retorna el objeto creado con ID generado.
  // ---------------------------------------------------------------------------

  http.post('/api/users', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    return HttpResponse.json(
      {
        id: 'new-user-id',
        ...body,
        createdAt: new Date().toISOString()
      },
      { status: 201 }
    );
  }),

  // ---------------------------------------------------------------------------
  // EJEMPLO — DELETE /api/users/:id
  // Elimina un usuario y retorna 204 No Content.
  // ---------------------------------------------------------------------------

  http.delete('/api/users/:id', () => {
    return new HttpResponse(null, { status: 204 });
  })

  // ---------------------------------------------------------------------------
  // AGREGAR HANDLERS REALES DEL PROYECTO AQUÍ
  // ---------------------------------------------------------------------------
  //
  // Estructura recomendada para proyectos más grandes:
  //   src/mocks/handlers/
  //     auth.handlers.ts      → handlers de autenticación
  //     users.handlers.ts     → handlers de usuarios
  //     products.handlers.ts  → handlers de productos
  //
  // Y luego en este archivo:
  //   import { authHandlers }     from './handlers/auth.handlers'
  //   import { usersHandlers }    from './handlers/users.handlers'
  //   import { productsHandlers } from './handlers/products.handlers'
  //
  //   export const handlers = [
  //     ...authHandlers,
  //     ...usersHandlers,
  //     ...productsHandlers,
  //   ]
];
