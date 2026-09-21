# Migración a Astro — diagnóstico

**Fecha:** 2026-09-20 · **Estado:** diagnóstico, sin ejecutar.

Resumen: el sitio es **Jekyll + tema jekyll-now**, 16 posts y 10 páginas. La
migración a Astro es directa en volumen (contenido pequeño, un solo layout) y
**el riesgo está en la paridad de URLs**, no en la cantidad de trabajo. Lo
crítico: tres rutas están referenciadas desde fuera (Play Console, la app y
AdMob) y no pueden cambiar.

---

## 1. Qué hay hoy

| Pieza | Detalle |
|---|---|
| Posts | 16 en `_posts/`. Front matter **solo** `layout: post` + `title:` — la fecha vive en el nombre del archivo (`2020-3-2-fCC-Barbell-1.md`, mes sin cero) |
| Páginas | 10 con `permalink` explícito (ver §2). `index.html` con Liquid (lista de posts) |
| Layouts | `_layouts/{default,page,post}.html` (jekyll-now) |
| Includes | `_includes/{analytics,disqus,meta,svg-icons}.html` |
| Estilos | `style.scss` (287 líneas) + `_sass/{_variables,_reset,_svg-icons,_highlights}.scss` |
| Plugins | `jekyll-sitemap`, `jekyll-feed` |
| Estáticos | 25 imágenes en `images/` (incl. `images/sql-gym/*.webp`), `app-ads.txt` (291 líneas), `PostHogDPA.pdf` |
| Dominio | ninguno propio (`CNAME` vacío → `mkfnx.github.io`) |
| Deploy | `.github/workflows/jekyll.yml`: Ruby 3.4 → `bundle exec jekyll build` → `upload-pages-artifact` → `deploy-pages` |
| Analytics | `UA-68369311-3` — **Universal Analytics, dejó de procesar datos en jul-2023**; hoy no mide nada |
| Liquid | 11 `{{ site.baseurl }}` en 5 posts (imágenes y enlaces internos) |

Limpieza ya hecha en este cambio: se retiró el andamiaje de Pelican
(`content/`, `pelicanconf.py`, `publishconf.py`, `tasks.py`, `Makefile`,
`themes/`, `output/`, `pelican-plugins/`, `venv/`, copia anidada) y el
`.jekyll-cache/` que seguía trackeado. Respaldo de lo único irrecuperable en
`../mkfnx.github.io-pelican-backup-2026-09-20/`.

---

## 2. URLs que NO pueden cambiar

Lista completa y verificable en **`docs/current-urls.txt`** (57 URLs).

| URL | Quién la usa | Consecuencia si cambia |
|---|---|---|
| `/full-privacy-policy-es/` | **Play Console** (política de privacidad) **y la app** | La app la tiene hardcodeada en `lib/domain/app_links.dart` → obliga a publicar una versión nueva. La ficha de Play también apunta ahí |
| `/apps-privacy-policy-es/` | política resumida (puede estar registrada en otras apps) | Enlaces rotos en fichas de Play |
| `/sql-gym/` | "sitio web" en la ficha de Play + enlace del producto | Enlace roto en la tienda |
| `/pocketdecks/` | página de otra app | |
| `/app-ads.txt` | verificación **AdMob / Appodeal** (ruta raíz exacta) | Se pierde demanda de anuncios / verificación |
| `/PostHogDPA.pdf` | enlazado desde el aviso de privacidad | Enlace roto en la política |
| `/<slug>/` × 16 | SEO + enlaces internos | ⚠️ Dos tienen mayúsculas: `/Facebook-API-en-bot-de-Messenger/`, `/Facebook-API-in-Messenger-bot/` |
| `/feed.xml`, `/sitemap.xml`, `/style.css` | suscriptores RSS / Google / el layout | |
| `/about/`, `/amlito/`, `/longs_and_lives/`, `/shorts/`, `/technical_posts/`, `/404.html` | navegación | |

---

## 3. Trabajo que requiere la migración

1. **Scaffold.** `npm create astro@latest` (plantilla mínima, sin ejemplo).
   `astro.config.mjs` con `site: 'https://mkfnx.github.io'`,
   `trailingSlash: 'always'` y `build.format: 'directory'` para reproducir
   `/slug/` con barra final (lo que hace Jekyll con `permalink: /:title/`).
2. **Contenido → content collection.** `src/content/blog/*.md` con
   `src/content.config.ts` (loader `glob()`, schema `title`, `pubDate`,
   `description?`, `draft?`). Conversión de los 16 posts:
   - quitar `layout: post`, conservar `title`,
   - **`pubDate` desde el nombre del archivo** (Jekyll lo hacía solo),
   - **fijar `slug` explícito**: Astro genera slugs en minúsculas y rompería
     las dos URLs con mayúsculas (o configurar un `slugify` propio).
3. **Liquid → rutas.** 11 `{{ site.baseurl }}` en 5 posts. Con `baseurl` vacío
   hoy equivalen a `/images/...` y `/fCC-Barbell-1`. En Astro hay que
   reemplazarlos por rutas absolutas o `import.meta.env.BASE_URL`; si no, se
   imprimirían literalmente.
4. **Layouts → componentes.** `src/layouts/{Base,Page,Post}Layout.astro` desde
   `_layouts/*.html`, y los includes como componentes: `meta` (SEO/OG),
   `analytics` (decisión pendiente), `svg-icons`, `disqus` (no se usa → omitir).
5. **Estilos.** `style.scss` + los 4 parciales → `src/styles/global.scss`
   (Astro compila Sass con el paquete `sass`). Ojo: el resaltado de código pasa
   de **Rouge** a **Shiki**; `_sass/_highlights.scss` (clases `.highlight`) deja
   de aplicar y hay que re-estilar o adoptar un tema Shiki.
6. **Páginas.** `index.astro` (lista de posts), las 10 páginas con su ruta
   exacta, `404.astro`.
7. **Estáticos → `public/`**: `app-ads.txt`, `images/`, `PostHogDPA.pdf`. Las
   rutas se conservan tal cual (`/images/sql-gym/...`).
8. **Feed y sitemap.** `/feed.xml` con `@astrojs/rss` (misma ruta exacta) y
   `@astrojs/sitemap`.
9. **Deploy.** Sustituir `jekyll.yml` por uno de Astro: `setup-node` (20/22) →
   `npm ci` → `npm run build` → `upload-pages-artifact` con `path: dist` →
   `deploy-pages`. La configuración de Pages no cambia.
10. **Limpieza.** Borrar `Gemfile`, `Gemfile.lock`, `_config.yml`, `_layouts/`,
    `_includes/`, `_sass/`, `_posts/`, `style.scss`, `.jekyll-cache/`.

---

## 4. Trampas concretas (por orden de probabilidad)

1. **`package.json` está en `.gitignore`.** Si se deja así, `git add .` nunca
   sube la configuración del proyecto Astro y el deploy en CI falla. Ya lo
   quité del `.gitignore` en este cambio; añadí `dist/` y `.astro/`.
2. **Slugs en minúsculas.** Astro normaliza; hay 2 URLs con mayúsculas que hay
   que fijar explícitamente.
3. **Fechas.** Jekyll las saca del nombre del archivo; Astro exige `pubDate`
   (y el orden del listado depende de él).
4. **Barra final.** Sin `trailingSlash: 'always'` se generan `/slug` y `/slug/`
   como URLs distintas → canónicas duplicadas.
5. **Resaltado de código.** Rouge → Shiki: revisar los posts con bloques de
   código (fCC-Barbell, Netflix, mañaneras).
6. **Liquid dentro de bloques de código.** En Jekyll, Liquid corre antes de
   Markdown; en Astro se copia literal. Revisar los 5 posts con `{{`.
7. **`app-ads.txt`.** Mover su contenido a `public/` manteniendo la ruta raíz;
   si cambia de sitio o de contenido, AdMob/Appodeal pierden la verificación.
8. **Una sola URL rota en la política** obliga a versión nueva de la app (ver §2).

---

## 5. Plan por fases

| Fase | Contenido | Verificación |
|---|---|---|
| 1 | Rama `astro`, scaffold, `public/` estáticos, estilos portados | `npm run dev` se ve igual que hoy |
| 2 | Script de conversión de los 16 posts (front matter, `pubDate`, slugs, `{{ site.baseurl }}`) | 16 archivos en `src/content/blog/` |
| 3 | Layouts, páginas, feed, sitemap | `npm run build && npm run preview` |
| 4 | Workflow de deploy en la rama | build de CI en verde |
| 5 | **Paridad de URLs**: comparar las rutas generadas contra `docs/current-urls.txt` | 57/57 presentes, sin cambios de ruta |
| 6 | Merge a `master`, verificar en vivo | Play Console, `app-ads.txt`, AdMob, la app |

**Esfuerzo:** ~½ día para un port fiel (16 posts, 1 layout, 287 líneas de
SCSS). El tiempo se va en la paridad de URLs y en el resaltado de código, no en
el volumen.

---

## 6. Decisiones pendientes

1. **Analytics:** `UA-68369311-3` está muerto. ¿Crear una propiedad GA4
   (`G-…`) o quitar el tracking? (El aviso de privacidad menciona "análisis de
   funcionalidad del producto" en genérico, así que ninguna opción lo contradice.)
2. **Diseño:** ¿port fiel del tema jekyll-now (rápido) o aprovechar para
   rediseñar? Astro facilita lo segundo, pero multiplica el alcance.
3. **Alcance del blog:** ¿markdown simple o content collections con `tags` y
   páginas de tag? Hoy no hay tags.
4. **Las 3 páginas curadas** (`/shorts/`, `/technical_posts/`,
   `/longs_and_lives/`) son listas escritas a mano: ¿se quedan como páginas o
   pasan a colecciones?
5. **Comentarios:** Disqus está configurado vacío. ¿Seguir sin comentarios?

Cuando quieras, ejecuto las fases 1–5 en una rama y te dejo el diff de paridad
de URLs antes de tocar `master`.
