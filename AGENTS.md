# GobPlatform — Contexto para Agentes IA

> Este archivo es leído automáticamente por Antigravity antes de ejecutar cualquier tarea.
> Refleja el estado REAL del proyecto en producción.
> Última actualización: **v0.3** — Fase 2 (UI Shell Backoffice) + Fase 3a (Bandeja conectada a Supabase) completas.

## Phase Status

```
✅ Fase 3a completa (commit 5ddf76f):
- Bandeja conectada a Supabase via Drizzle
- 5 componentes UI en producción
- Seed con 7 requests, 5 ciudadanos, 13 SLA policies
- SLA calculado en runtime

🚀 Próximo: Fase 3b — /bandeja/[id] perfil 360° ciudadano (tokens_3)
```

---

## Qué es este proyecto

**GobPlatform** es una plataforma integral de gobierno con visión 360° del ciudadano.
Permite que cualquier agente del Estado o ciudadano pueda responder en menos de 10 segundos:
quién es la persona, qué hizo, qué tiene pendiente, qué recibió, qué se le comunicó y qué evidencia existe.

---

## URLs de producción — Vercel

| App | URL | Estado |
|-----|-----|--------|
| Portal ciudadano | https://gob-platform-portal.vercel.app | ✅ Deployado |
| Backoffice operadores | https://gob-platform-backoffice.vercel.app | ✅ Auth funcionando |
| Supervisor / BI | https://gob-platform-supervisor.vercel.app | ✅ Deployado |

**CI/CD:** Cada push a `main` en GitHub dispara deploy automático en los 3 proyectos Vercel.
**Caché:** Turborepo remote caching activo en Vercel — los builds son incrementales.

---

## Stack tecnológico

| Capa | Tecnología | Estado |
|------|-----------|--------|
| Framework | Next.js 15 (App Router) + TypeScript strict | ✅ Operativo |
| Monorepo | Turborepo (npm workspaces) | ✅ Operativo |
| Estilos | Tailwind CSS v4 + postcss.config.mjs | ✅ Operativo |
| ORM | Drizzle ORM → PostgreSQL (Supabase) | ✅ Sincronizado |
| Validación | Zod en todos los inputs y API routes | ✅ Configurado |
| Auth Backoffice | NextAuth.js v5 — Credentials + JWT + Edge middleware | ✅ En producción |
| Auth Portal | NextAuth.js v5 — Email + OTP | 🔲 Pendiente Fase 2 |
| Deploy | Vercel — 3 proyectos separados, CI/CD desde GitHub main | ✅ Operativo |
| DB Conexión | Supabase Pooler — pgbouncer, IPv4, puerto 6543 | ✅ Resuelto |
| IA | Claude API (Anthropic) | 🔲 Fase 5 |
| Archivos | Supabase Storage | 🔲 Fase 2 |

---

## Estructura del repositorio

```
GobPlatform/
├── apps/
│   ├── portal/        → https://gob-platform-portal.vercel.app — puerto local 4000
│   ├── backoffice/    → https://gob-platform-backoffice.vercel.app — puerto local 4001
│   └── supervisor/    → https://gob-platform-supervisor.vercel.app — puerto local 4002
├── packages/
│   ├── db/
│   │   └── src/
│   │       ├── schema/
│   │       │   ├── identity.ts      → citizen y tablas relacionadas (7 tablas)
│   │       │   ├── organization.ts  → organization_unit, internal_user, role, user_role, service_catalog
│   │       │   ├── demand.ts        → request, case, procedure, interaction, work_item, assignment_history
│   │       │   └── audit.ts         → document, request_document, sla_policy, notification, survey_response, audit_event
│   │       ├── queries/
│   │       │   └── users.ts         → getUserByEmail con roles relacionales (Drizzle)
│   │       └── db.ts                → cliente Drizzle + Supabase pooler
│   ├── types/         → Enums de dominio, interfaces de sesión
│   └── config/        → Tailwind, TypeScript, ESLint compartidos
├── infra/
│   ├── migrations/    → SQL generado por Drizzle Kit
│   └── seeds/         → Datos iniciales
└── turbo.json         → Pipeline con env vars declaradas para Vercel
```

---

## Decisiones de arquitectura tomadas — NO cambiar sin consenso

### 1. Puertos de desarrollo local
- Portal: **4000**
- Backoffice: **4001**
- Supervisor: **4002**

### 2. Conexión Supabase — SIEMPRE el pooler con pgbouncer

```bash
# NUNCA — rompe en Vercel por DNS/IPv6:
DATABASE_URL=postgresql://postgres:[PASS]@db.xxx.supabase.co:5432/postgres

# SIEMPRE — Connection Pooling, Transaction Mode, IPv4:
DATABASE_URL=postgresql://postgres.xlxjichvzgbcciacsoam:[PASS]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

El error que resuelve esto es `getaddrinfo ENOTFOUND` — Vercel Edge necesita IPv4
y Supabase por defecto expone IPv6 en la conexión directa.

### 3. Auth backoffice — patrón Edge/Node.js split — NUNCA unificar

```
apps/backoffice/src/
├── auth.config.ts  → Edge Runtime SOLO: JWT callbacks + reglas de redirección.
│                     SIN imports de bcrypt, postgres ni getUserByEmail.
├── auth.ts         → Node.js Runtime: Credentials provider + bcrypt + getUserByEmail.
│                     Importa y extiende authConfig.
└── middleware.ts   → Edge: importa SOLO authConfig. Nunca importar auth.ts aquí.
```

Si se unifica en un archivo, el middleware rompe en producción Vercel
porque Edge Runtime no puede ejecutar bcrypt ni módulos Node.js nativos.

### 4. Variables de entorno en producción (Vercel)

```env
# backoffice
AUTH_URL="https://gob-platform-backoffice.vercel.app"
AUTH_SECRET="[secreto de producción]"
DATABASE_URL="postgresql://postgres.xxx:[PASS]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# portal (cuando se implemente el OTP)
AUTH_URL="https://gob-platform-portal.vercel.app"
AUTH_SECRET="[secreto separado del backoffice]"
# + variables de email para envío de OTP (Resend o SMTP)
```

Cada app tiene su propio `AUTH_URL` y `AUTH_SECRET` — no compartir entre apps.

### 5. Turborepo — env vars de build declaradas en turbo.json

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL"]
    }
  }
}
```

Si se agrega una variable nueva que se usa en build time,
debe declararse en este array o el caché de Turborepo se invalida incorrectamente.

### 6. PK de internal_user es `id` (no `user_id` ni `userId`)

```typescript
export const internalUser = pgTable('internal_user', {
  id: uuid('id').primaryKey().defaultRandom(),  // ← siempre 'id'
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### 7. Sesiones tipadas — dos interfaces separadas

```typescript
// Portal (ciudadano)
interface CitizenSession {
  citizenId: string
  fullName: string
  email: string
}

// Backoffice (operador)
interface OperatorSession {
  id: string           // internalUser.id
  fullName: string
  email: string
  roles: string[]      // ['operator'] | ['supervisor'] | ['admin']
}
```

---

## Base de datos — 24 tablas core (operativas en Supabase)

### identity.ts — 7 tablas
`citizen` · `citizen_identifier` · `citizen_contact` · `address` · `citizen_address` · `citizen_relation` · `consent`

### organization.ts — 5 tablas
`organization_unit` · `internal_user` · `role` · `user_role` · `service_catalog`

> **service_catalog es la tabla de verdad del sistema.**
> Todo `request` debe referenciar un registro aquí. Sin esto no hay BI ni SLA.

### demand.ts — 6 tablas
`request` · `case` · `procedure` · `interaction` · `work_item` · `assignment_history`

### audit.ts — 6 tablas
`document` · `request_document` · `sla_policy` · `notification` · `survey_response` · `audit_event`

---

## Reglas de desarrollo — cumplir siempre

### REGLA DE COMMITS — obligatoria desde v0.4
- Durante una sesión de trabajo: acumular todos los cambios localmente
- UN solo commit y push al cerrar la sesión o al terminar un módulo completo
- NUNCA hacer push después de cada fix individual
- Vercel tiene límite de 100 deployments/día — cada push dispara uno automático
- Excepción: si hay un bug crítico en producción que bloquea usuarios reales

### 1. audit_event en toda mutación importante
```typescript
await db.insert(auditEvent).values({
  actorUserId: session.id ?? null,
  actorType: 'internal',          // 'internal' | 'citizen' | 'system'
  entityType: 'request',
  entityId: requestId,
  action: 'create',               // 'create' | 'update' | 'delete' | 'view' | 'download'
  ip: req.headers.get('x-forwarded-for') ?? undefined,
  metadataJson: { serviceId, priority }
})
```

### 2. Zod en toda surface de API
```typescript
const schema = z.object({
  citizenId: z.string().uuid(),
  serviceId: z.string().uuid(),
  priority: z.number().int().min(1).max(5),
})
const input = schema.parse(await request.json())
```

### 3. Respuesta estándar de API
```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string }
```

### 4. Drizzle ORM siempre — sin SQL crudo
Preferir `db.query.*` para queries con relaciones.
`db.select().from().where()` para queries simples.

---

## Estado del proyecto

```
✅ FASE 1 — Cimientos (COMPLETA)
   [x] Monorepo Turborepo: 3 apps + 3 packages
   [x] Schema Drizzle ORM: 24 tablas core en Supabase
   [x] Conexión Supabase: pooler pgbouncer IPv4 puerto 6543
   [x] Vercel: 3 proyectos deployados con CI/CD desde GitHub
   [x] Auth backoffice: Credentials + bcrypt + JWT + Edge middleware en producción

✅ FASE 2 — UI Shell Backoffice (COMPLETA — v0.3)
   [x] Tailwind CSS v4 + postcss.config.mjs configurado
   [x] Design tokens unificados (@theme: primary #2c6bc3, gob-blue #0A2540)
   [x] 5 componentes atómicos: SLABadge, PriorityIndicator, StatusBadge, ChannelBadge, CitizenAvatar
   [x] Sidebar toggleable 72px/256px con estado activo
   [x] Login page: gradiente deep-blue, card blanca, Material Symbols
   [x] Dashboard layout shell con auth guard

✅ FASE 3a — Bandeja Operativa (COMPLETA — v0.3)
   [x] /bandeja: async Server Component con Drizzle JOINs a Supabase
   [x] SLA calculado en runtime desde dueAt (on_time/at_risk/overdue)
   [x] Seed: 3 servicios, 13 SLA policies, 5 ciudadanos, 7 requests
   [x] getRequests() query en packages/db/src/queries/bandeja.ts

🚀 FASE 3b — Gestión de Casos (EN PROGRESO)
   [x] /bandeja/[id] → perfil 360° ciudadano + timeline (tokens_3)
   [x] /casos/[id]   → flujo de trabajo del caso (tokens_4)
   [x] /casos/[id] tab IA → panel sugerencias Claude API (tokens_5)
   [x] Asignación y cambio de estado con audit_event

🔲 FASE 4 — Portal del Ciudadano
🔲 FASE 5 — Turnos, Territorio y Pagos
🔲 FASE 6 — Programas Sociales, IA e Interoperabilidad
🔲 FASE 7 — BI, Gobierno y Madurez
```

---

## Instrucciones para el agente en Antigravity

- **Planning Mode** para cualquier tarea que toque DB, auth, nuevos módulos o arquitectura
- **Fast Mode** para fixes puntuales, ajustes de UI, agregar un campo
- **Claude Sonnet 4.5** para auth, lógica de dominio, auditoría, queries complejas, seguridad
- **Gemini 3 Pro** para componentes de UI, formularios, listados, boilerplate
- **Un agente por módulo** — no mezclar tareas de DB con UI en la misma sesión
- Al iniciar cada sesión: "Estamos en Fase X, módulo Y — el contexto está en AGENTS.md"
- Al cerrar cada fase: actualizar los checkboxes y decisiones de arquitectura en este archivo

---

*GobPlatform — github.com/joerey101/GobPlatform*
