# Exámenes MPF — Plataforma de práctica

Plataforma web de práctica de exámenes para aspirantes al **Ministerio Público Fiscal**.
Modelo: pago único (AR$5000) vía Mercado Pago, login con Google, acceso libre a 30
exámenes tras pagar. Cada examen tiene 25 preguntas de opción múltiple (una sola
correcta) + 1 caso práctico; corrección automática con devolución por tema.

> Estado: **esqueleto inicial**. Páginas navegables + utilidades de corrección.
> Todavía **sin** integración de auth, pagos ni base de datos.

## Stack

- **Next.js** (App Router, TypeScript, ESLint) — sin Turbopack experimental
- **Vercel** (deploy)
- **Supabase** (base de datos / persistencia)
- **Mercado Pago** (pago único)
- **Google OAuth** (login)

## Estructura

```
data/examenes/   → los 30 exámenes en JSON (examen-01 … examen-30)
lib/             → utilidades puras (carga, selección, corrección, devolución)
app/             → páginas (/, /login, /pago, /examen, /resultado)
components/      → UI reutilizable
```

## Credenciales

**Todas las credenciales van en variables de entorno, nunca en el código ni en el
repositorio.** Ver `.env.example` para la lista de variables necesarias (Google
OAuth, Mercado Pago, Supabase). Crear un `.env.local` a partir de ese archivo.
`.env*` está incluido en `.gitignore`.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
```
