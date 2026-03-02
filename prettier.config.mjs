// =============================================================================
// prettier.config.mjs — Configuración de Prettier
// =============================================================================
//
// 📦 Versión: Prettier 3.x
// 🛠  Stack:  Next.js 16 · TypeScript 5.7+ · Tailwind CSS
//
// ¿Por qué un archivo .mjs en vez de .prettierrc.json?
//   El formato .mjs permite agregar comentarios y lógica condicional.
//   .prettierrc.json es más simple pero no admite comentarios.
//   Ambos son igualmente válidos; este formato es preferido para equipos
//   porque permite documentar cada decisión directamente en el archivo.
//
// Plugins habilitados en este archivo:
//   1. prettier-plugin-tailwindcss      → ordena clases de Tailwind automáticamente
//   2. prettier-plugin-organize-imports → ordena y agrupa imports de TS/JS
//   3. @prettier/plugin-xml             → formatea archivos XML y SVG
//   4. prettier-plugin-packagejson      → ordena keys de package.json
//
// 📦 COMANDO DE INSTALACIÓN (todos los plugins de una vez):
//   bun add -d \
//     prettier \
//     prettier-plugin-tailwindcss \
//     prettier-plugin-organize-imports \
//     @prettier/plugin-xml \
//     prettier-plugin-packagejson
// =============================================================================

/** @type {import('prettier').Config} */
const config = {
  // ---------------------------------------------------------------------------
  // FORMATO GENERAL
  // ---------------------------------------------------------------------------

  // Longitud máxima de línea antes de hacer wrap.
  // 80 es el estándar histórico (terminales, GitHub diffs en pantallas pequeñas).
  // Alternativa: 100 o 120 para monitores modernos o proyectos con JSX complejo.
  printWidth: 80,

  // Tamaño de indentación en espacios.
  // 2 es el estándar en el ecosistema JS/TS/React.
  // Alternativa: 4 para proyectos Python-style o preferencia del equipo.
  tabWidth: 2,

  // Usa espacios en vez de tabs para indentar.
  // false = usar tabs (mejor para accesibilidad, permite que cada dev configure el tamaño visual).
  // true  = usar espacios (más consistente en diffs y herramientas web como GitHub).
  useTabs: false,

  // Punto y coma al final de cada sentencia.
  // true  = siempre agregar ; (más seguro, evita bugs con ASI en edge cases).
  // false = omitir ; (estilo moderno preferido por algunos proyectos como Vue).
  semi: true,

  // ---------------------------------------------------------------------------
  // COMILLAS
  // ---------------------------------------------------------------------------

  // Comillas simples en JS/TS.
  // true  = 'comillas simples' (estándar en la mayoría de proyectos JS/TS).
  // false = "comillas dobles" (estándar en JSON y HTML, preferido en algunos equipos).
  singleQuote: true,

  // Comillas dobles en JSX/TSX (atributos HTML).
  // true  = <Component className="valor"> (convención HTML estándar).
  // false = <Component className='valor'> (consistente con JS pero inusual en HTML).
  jsxSingleQuote: false,

  // ---------------------------------------------------------------------------
  // COMAS FINALES (trailing commas)
  // ---------------------------------------------------------------------------

  // 'all'  = comas en todos los lugares válidos: arrays, objetos, parámetros de función.
  //          Produce diffs más limpios (solo se modifica la línea con el nuevo elemento).
  //          Es el valor recomendado para equipos con git.
  // 'es5'  = comas solo donde ES5 las permite (no en parámetros de función).
  // 'none' = sin comas finales (útil para bases de código legacy).
  trailingComma: 'none',

  // ---------------------------------------------------------------------------
  // ESPACIADO
  // ---------------------------------------------------------------------------

  // Espacios dentro de llaves de objetos: { foo: bar } en vez de {foo: bar}.
  // true  = con espacios (más legible, estándar en la comunidad JS).
  bracketSpacing: true,

  // En JSX, el > de cierre de un componente multilinea va en su propia línea.
  // true  = el > va al final de la última prop (ahorra una línea).
  // false = el > va en una nueva línea (más legible en componentes complejos).
  //
  // Ejemplo con true:
  //   <Component
  //     prop="valor">
  //
  // Ejemplo con false (default):
  //   <Component
  //     prop="valor"
  //   >
  bracketSameLine: false,

  // Paréntesis en arrow functions de un solo parámetro.
  // 'always' = (x) => x  (más consistente, facilita agregar tipos TS: (x: string) => x).
  // 'avoid'  = x => x    (más conciso, estilo funcional clásico).
  arrowParens: 'always',

  // ---------------------------------------------------------------------------
  // FINALES DE LÍNEA
  // ---------------------------------------------------------------------------

  // Tipo de salto de línea.
  // 'lf'   = Unix/Mac (recomendado para proyectos con git en equipos mixtos).
  //          Evita diffs masivos cuando Windows cambia CRLF a LF.
  // 'crlf' = Windows.
  // 'auto' = detecta automáticamente (puede causar inconsistencias en equipos).
  endOfLine: 'lf',

  // ---------------------------------------------------------------------------
  // PLUGINS
  // ---------------------------------------------------------------------------
  //
  // ORDEN IMPORTANTE: la secuencia de plugins importa.
  //   1. prettier-plugin-organize-imports  → reorganiza imports primero
  //   2. prettier-plugin-packagejson       → ordena package.json antes del formato final
  //   3. @prettier/plugin-xml              → formatea XML/SVG de forma independiente
  //   4. prettier-plugin-tailwindcss       → SIEMPRE al final: necesita ver el JSX
  //                                          ya procesado para ordenar las clases
  //
  plugins: [
    // -------------------------------------------------------------------------
    // 1. prettier-plugin-organize-imports
    //    Ordena y agrupa automáticamente los imports de TypeScript y JavaScript.
    //    Usa el Language Service de TypeScript internamente (igual que el editor).
    //
    //    Qué hace:
    //      - Elimina imports no utilizados
    //      - Agrupa: externos (npm) → internos (@/) → relativos (./)
    //      - Ordena alfabéticamente dentro de cada grupo
    //      - Separa correctamente 'import type' de imports de valor
    //
    //    Ejemplo:
    //      ANTES:  import { useState } from 'react'
    //              import { Button } from '@/components/Button'
    //              import { useRouter } from 'next/navigation'
    //      DESPUÉS: import { useRouter } from 'next/navigation'
    //              import { useState } from 'react'
    //              import { Button } from '@/components/Button'
    //
    //    ⚠️ CONFLICTO CON ESLINT: si tienes la regla import/order activa en ESLint,
    //       desactívala y deja que este plugin maneje el orden. Tener ambos con
    //       configs distintas genera conflictos en cada guardado.
    //
    //    ⚠️ SOLO TYPESCRIPT: usa el TS Language Service. Para proyectos JS puro
    //       sin tsconfig usar @trivago/prettier-plugin-sort-imports como alternativa.
    'prettier-plugin-organize-imports',

    // -------------------------------------------------------------------------
    // 2. prettier-plugin-packagejson
    //    Ordena las keys de package.json según la convención estándar de npm.
    //
    //    Por qué es valioso en equipos:
    //    package.json es el archivo que más conflictos de merge genera cuando
    //    dos devs añaden dependencias simultáneamente. Con orden determinístico
    //    y automático, los conflictos se resuelven solos y los diffs son limpios.
    //
    //    Orden que aplica (convención npm):
    //      name → version → description → keywords → homepage → bugs →
    //      license → author → files → main → module → exports →
    //      types → bin → scripts → dependencies → devDependencies →
    //      peerDependencies → optionalDependencies → engines
    //
    //    ⚠️ SOLO APLICA A package.json, no a otros archivos JSON del proyecto.
    'prettier-plugin-packagejson',

    // -------------------------------------------------------------------------
    // 3. @prettier/plugin-xml
    //    Formatea archivos XML y SVG con las mismas reglas de indentación
    //    y estilo que el resto del proyecto.
    //
    //    Útil en Next.js para:
    //      - Archivos SVG independientes en /public o /assets
    //      - sitemap.xml, robots.xml, feed.xml generados
    //      - Archivos de internacionalización en formato XLIFF (.xlf)
    //      - Configuraciones de herramientas que usan XML
    //
    //    La configuración específica del plugin está en el override de *.xml/*.svg
    //    más abajo (xmlWhitespaceSensitivity, xmlSelfClosingSpace, etc.)
    //
    //    ⚠️ SVG INLINE EN JSX: este plugin NO afecta SVGs dentro de .tsx.
    //       Los SVGs inline son procesados como JSX, no como XML.
    //       Solo aplica a archivos .svg y .xml independientes.
    '@prettier/plugin-xml',

    // -------------------------------------------------------------------------
    // 4. prettier-plugin-tailwindcss
    //    Ordena automáticamente las clases de Tailwind según el orden oficial.
    //    Elimina discusiones en PRs sobre el orden de clases CSS.
    //
    //    Orden que aplica:
    //      layout → positioning → sizing → spacing →
    //      typography → backgrounds → borders → effects
    //
    //    Ejemplo:
    //      ANTES:  "text-sm font-bold flex mt-4 items-center bg-blue-500"
    //      DESPUÉS: "mt-4 flex items-center bg-blue-500 text-sm font-bold"
    //
    //    ⚠️ DEBE SER EL ÚLTIMO PLUGIN: necesita ver el JSX ya procesado
    //       por los plugins anteriores para ordenar las clases correctamente.
    //
    //    Alternativa: eslint-plugin-tailwindcss con tailwindcss/classnames-order.
    //    Diferencia: ESLint reporta el error pero no autoformatea;
    //    este plugin autoformatea directamente al guardar.
    'prettier-plugin-tailwindcss'
  ],

  // Ruta al archivo de configuración de Tailwind para que el plugin
  // pueda leer los colores, fuentes y breakpoints customizados.
  // Ajusta la ruta si tu tailwind.config está en una ubicación diferente.
  // En Next.js 16 + Tailwind v4, esta opción puede no ser necesaria si
  // Tailwind detecta la configuración automáticamente mediante CSS @config.
  tailwindStylesheet: './app/globals.css',

  // ---------------------------------------------------------------------------
  // OVERRIDES POR TIPO DE ARCHIVO
  // ---------------------------------------------------------------------------

  overrides: [
    // -------------------------------------------------------------------------
    // JSON y JSONC
    // -------------------------------------------------------------------------
    // prettier-plugin-packagejson usa este override para package.json.
    // El plugin aplica su ordenamiento ANTES de que Prettier formatee,
    // así que estas opciones se aplican al resultado ya ordenado.
    {
      files: ['*.json', '*.jsonc'],
      options: {
        // JSON estricto NO permite trailing commas. JSON5/JSONC sí las permite,
        // pero para máxima compatibilidad (tsconfig, package.json, etc.) usamos none.
        trailingComma: 'none',
        // Los JSON suelen tener estructuras más anchas que el código TS.
        // 100 evita que Prettier rompa objetos simples en múltiples líneas.
        printWidth: 100
      }
    },

    // -------------------------------------------------------------------------
    // Markdown y MDX
    // -------------------------------------------------------------------------
    {
      files: ['*.md', '*.mdx'],
      options: {
        // 'preserve' evita que Prettier rompa párrafos de documentación.
        // Si el equipo prefiere que Prettier controle el ancho del texto:
        //   proseWrap: 'always' → reformatea párrafos al printWidth definido
        //   proseWrap: 'never'  → nunca rompe líneas (un párrafo = una línea)
        proseWrap: 'preserve',
        printWidth: 100
      }
    },

    // -------------------------------------------------------------------------
    // CSS y SCSS
    // -------------------------------------------------------------------------
    {
      files: ['*.css', '*.scss'],
      options: {
        // En CSS las comillas dobles son la convención estándar (W3C).
        // Difiere de JS/TS donde usamos singleQuote: true.
        singleQuote: false,
        // CSS con muchos selectores anidados puede necesitar más espacio.
        // Aumentar a 120 si usas SCSS con BEM o anidamiento profundo.
        printWidth: 80
      }
    },

    // -------------------------------------------------------------------------
    // XML y SVG — configuración de @prettier/plugin-xml
    // -------------------------------------------------------------------------
    // Este override activa y configura el plugin XML para archivos .xml y .svg.
    // Los SVGs inline en .tsx NO son afectados (se procesan como JSX).
    {
      files: ['*.xml', '*.svg'],
      options: {
        // Controla cómo Prettier trata los espacios en texto dentro de XML.
        //
        // 'ignore'  = ignora los espacios en blanco al reformatear (recomendado).
        //             Prettier reestructura el XML libremente.
        // 'strict'  = preserva todos los espacios (útil para XML con texto mixto
        //             donde los espacios tienen significado semántico, como XHTML).
        // 'preserve'= preserva los espacios tal como están en el archivo original.
        //
        // Para SVGs y configs XML donde el texto no importa: 'ignore'
        // Para XHTML o XML con contenido textual importante: 'strict'
        xmlWhitespaceSensitivity: 'ignore',

        // Agrega un espacio antes del /> en tags self-closing.
        //   true:  <path d="..." />   ← más legible, más común en SVG/XML moderno
        //   false: <path d="..."/>    ← más compacto
        xmlSelfClosingSpace: true,

        // Tipo de comillas en los atributos XML.
        // 'double' es el estándar de XML/HTML (W3C lo recomienda).
        // 'single' se usa en algunos ecosistemas pero no es el estándar XML.
        xmlQuoteAttributes: 'double',

        // Ordena los atributos de cada elemento XML alfabéticamente.
        //   true:  útil para SVGs generados por herramientas (muchos atributos desordenados)
        //          y para archivos de configuración XML donde el orden no importa.
        //   false: preserva el orden original (importante si el orden semántico importa,
        //          como en algunos documentos XLIFF o XML con DTD que requiere orden).
        //
        // Para SVGs de íconos y assets: true (facilita diffs y revisión)
        // Para XML de datos o internacionalización: false (el orden puede importar)
        xmlSortAttributesByKey: false,

        // Ancho de línea para XML. Los SVGs complejos pueden tener atributos muy largos.
        // 120 evita que Prettier fragmente atributos de path de SVG innecesariamente.
        printWidth: 120
      }
    },

    // -------------------------------------------------------------------------
    // YAML (GitHub Actions, Docker Compose, configuraciones de CI)
    // -------------------------------------------------------------------------
    // Prettier formatea YAML nativamente sin plugins adicionales.
    {
      files: ['*.yml', '*.yaml'],
      options: {
        // YAML convencional usa comillas simples para strings que las necesitan.
        // false = comillas dobles (más común en GitHub Actions y configuraciones).
        singleQuote: false,
        // YAML de CI/CD suele tener líneas largas por los comandos de shell.
        printWidth: 120,
        // tabWidth de 2 es el estándar universal en YAML.
        tabWidth: 2
      }
    }
  ]
};

export default config;

// =============================================================================
// 🔧 OPCIONES ADICIONALES NO INCLUIDAS (pero útiles según el caso):
//
// rangeStart / rangeEnd
//   Permite formatear solo un rango específico de caracteres del archivo.
//   Esto NO se configura en el archivo del proyecto, sino que se pasa
//   directamente en la integración del editor o en scripts personalizados:
//     prettier --range-start 100 --range-end 500 archivo.ts
//   Útil para integraciones de editores, no para configuración global.
//
// prettier-plugin-sh
//   Formatea scripts de shell (.sh, .bash, .zsh).
//   Útil si el proyecto tiene scripts de CI, deployment o setup en shell.
//   Requiere: bun add -d prettier-plugin-sh
//   Agregar 'prettier-plugin-sh' al array de plugins y este override:
//     { files: ['*.sh', '*.bash'], options: { keepComments: true } }
//
// @trivago/prettier-plugin-sort-imports
//   Alternativa a prettier-plugin-organize-imports para proyectos JS puro.
//   No requiere TypeScript. Permite configurar grupos de imports manualmente.
//   Requiere: bun add -d @trivago/prettier-plugin-sort-imports
//   ⚠️  No usar junto a prettier-plugin-organize-imports (hacen lo mismo).
//
// prettier-plugin-prisma
//   Formatea archivos schema.prisma. Solo relevante si el proyecto
//   tiene un backend con Prisma en el mismo repositorio (monorepo).
//   Requiere: bun add -d prettier-plugin-prisma
// =============================================================================

// =============================================================================
// 📦 COMANDO DE INSTALACIÓN DE TODOS LOS PLUGINS
//
// Copia y pega este comando para instalar todas las dependencias de una vez:
//
// bun add -d prettier prettier-plugin-tailwindcss prettier-plugin-organize-imports @prettier/plugin-xml prettier-plugin-packagejson
//
// =============================================================================
