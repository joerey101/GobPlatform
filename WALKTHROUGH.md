# GobPlatform — WALKTHROUGH.md
> Memoria persistente entre sesiones. Actualizar al cerrar cada fase.

---

## v0.3 — Cierre de Fase 3a (23 Feb 2026)
**Commit:** `49ebe89` | **Rama:** `main`

### ✅ Fase 2 — UI Shell Backoffice

**Fix crítico:** faltaba `apps/backoffice/postcss.config.mjs`. Sin él, Tailwind v4 no procesaba ninguna clase CSS.

**Design Tokens** (`globals.css` con `@theme`):
- `primary: #2c6bc3` — azul gobierno
- `gob-blue: #0A2540` — sidebar y gradiente login
- `background-light: #f6f7f8` — fondo general

**Componentes atómicos** (`apps/backoffice/src/components/ui/`):
| Componente | Props clave |
|---|---|
| `SLABadge` | `on_time` / `at_risk` / `overdue` |
| `PriorityIndicator` | `'1'`–`'5'` (DB) ó `p1`–`p5`, pulse-dot animado |
| `StatusBadge` | Todos los `requestStatusEnum` + fallback seguro |
| `ChannelBadge` | `whatsapp / email / web / in_person` |
| `CitizenAvatar` | verified / pending, tamaños sm/md/lg |

**Sidebar:** toggleable 72px (colapsado) ↔ 256px (expandido), click en header para toggle.

**Login:** gradiente `#0A2540→#1A4B8F`, card blanca, Material Symbols icons.

---

### ✅ Fase 3a — Bandeja Operativa

**Arquitectura:**
```
/bandeja → async Server Component
  └─ getRequests() [packages/db/src/queries/bandeja.ts]
       ├─ JOIN citizen        → citizenFullName
       ├─ JOIN service_catalog → serviceName
       └─ LEFT JOIN sla_policy → resolutionHours
              ↳ computeSlaStatus(dueAt, resolutionHours) → SlaStatus
```

**Cálculo SLA en runtime:**
```ts
// On time:  now < dueAt - 20% resolutionHours
// At risk:  now ≥ dueAt - 20%
// Overdue:  now ≥ dueAt
```

**Seed ejecutado** (idempotente, `ON CONFLICT DO NOTHING`):
- 3 roles, 2 org units
- 2 usuarios: `admin@gobplatform.ar` / `Admin2024!`
- 3 servicios: Reclamo General, Permiso Comercial, Actualización de Datos
- 13 SLA policies
- 5 ciudadanos con DNI verificado
- 7 requests con SLA variados

**Correr seed:**
```bash
DATABASE_URL="$(python3 -c "import re; c=open('apps/backoffice/.env.local').read(); m=re.search(r'DATABASE_URL=\"([^\"]+)\"', c); print(m.group(1))")" \
  node infra/seeds/node_modules/.bin/tsx infra/seeds/seed.ts
```

---

### 🔧 Decisiones de arquitectura nuevas (v0.3)

**8. Tailwind v4 requiere postcss.config.mjs**
```js
// apps/backoffice/postcss.config.mjs
const config = { plugins: { '@tailwindcss/postcss': {} } }
export default config
```
Sin este archivo, Next.js no procesa el CSS. NO usar `tailwind.config.ts` con Tailwind v4.

**9. Priority enum en DB es string '1'-'5'** (no integer)
El `priorityEnum` de Drizzle usa `pgEnum('priority', ['1','2','3','4','5'])`.
Los componentes de UI deben aceptar `string`, no `number`.

**10. DATABASE_URL local — pooler SIEMPRE**
```
postgresql://postgres.xlxjichvzgbcciacsoam:PWD@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**11. Dev server local**
```bash
cd apps/backoffice && ../../node_modules/.bin/next dev --port 4001
```
No usar `npm run dev` desde la raíz sin turbo.

---

### 🚀 Próximo — Fase 3b

| Ruta | Descripción | HTML de referencia |
|---|---|---|
| `/bandeja/[id]` | Perfil 360° ciudadano + timeline de interacciones | `tokens_3` |
| `/casos/[id]` | Flujo de pasos del caso + work_items | `tokens_4` |
| `/casos/[id]` tab IA | Panel sugerencias Claude API | `tokens_5` |

Al iniciar la próxima sesión: *"Estamos en Fase 3b — arranquemos con `/bandeja/[id]`, el perfil del ciudadano, basado en `tokens_3/code.html`"*

---

## v0.2 — Fase 2a — Auth + DB (sesión anterior)
- NextAuth v5 Credentials + bcrypt + JWT + Edge middleware
- Drizzle ORM 24 tablas — migración aplicada en Supabase
- Conexión pooler pgbouncer IPv4 (puerto 6543)
- Auth en producción: `gob-platform-backoffice.vercel.app`

## v0.1 — Fase 1 — Cimientos
- Monorepo Turborepo: 3 apps + 3 packages
- 3 proyectos Vercel con CI/CD desde GitHub
