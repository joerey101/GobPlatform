# Resumen Fase 1 y 2a — GobPlatform

Éste documento resume el código central, estructura y flujo de la **Fase 1 (Fundamentos y Schema)** y la **Fase 2a (Autenticación Backoffice y Edge Runtime en Vercel)** que hemos implementado para el GobPlatform.

---

## 🏗️ 1. Arquitectura del Monorepo (Turborepo)

La aplicación usa un esquema de monorepositorio administrado por `turbo`. Separamos dominios lógicos entre aplicaciones React rutables (`apps/*`) y dependencias o lógicas compartidas encapsuladas (`packages/*`).

```text
GobPlatform/
├── apps/
│   ├── portal/        (Next.js App Router — https://gob-platform-portal.vercel.app/)
│   ├── backoffice/    (Next.js App Router — https://gob-platform-backoffice.vercel.app/)
│   └── supervisor/    (Next.js App Router — https://gob-platform-supervisor.vercel.app/)
├── packages/
│   ├── config/        (Tailwind, TypeScript, ESLint rules)
│   ├── types/         (Domain Enums, Session Interfaces)
│   └── db/            (Drizzle ORM: Schema, Migrations, Client)
```

### pipeline de Build (turbo.json)
Turborepo maneja el caché y las dependencias de build para Vercel:
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["DATABASE_URL", "AUTH_SECRET", "AUTH_URL"]
    },
    // ...
  }
}
```

---

## 🗄️ 2. Base de Datos Extendida (Drizzle ORM)

Se abstrajo la conexión a base de datos en `packages/db`. Se diseñaron 24 tablas base resolviendo identidades (Ciudadanos, Usuarios Internos) y el flujo del negocio (Solicitudes, Trámites, Casos, SLAs, Auditoría).

```typescript
// packages/db/src/schema/identity.ts
export const internalUser = pgTable('internal_user', {
    id: uuid('id').primaryKey().defaultRandom(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
})

// packages/db/src/schema/organization.ts
export const userRole = pgTable('user_role', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => internalUser.id).notNull(),
    roleId: uuid('role_id').references(() => role.id).notNull(),
})
```

### Consultas Relacionales (Drizzle Queries)
Drizzle nos permite traer el usuario con sus roles de una sola vez configurando el objeto `relations`.

```typescript
// packages/db/src/queries/users.ts
export async function getUserByEmail(email: string) {
    const user = await db.query.internalUser.findFirst({
        where: eq(internalUser.email, email),
        with: {
            roles: {
                with: {
                    role: true
                }
            }
        }
    })
    
    // ... formateo y retorno estructurado ...
}
```

---

## 🔐 3. Autenticación y Edge Runtime (NextAuth v5)

Para proteger `apps/backoffice`, usamos NextAuth JS v5. Su gran beneficio es el soporte para JWT y Middlewares de protección (Edge). Sin embargo, dividimos la config en dos archivos para compatibilidad con Vercel.

### A) Edge Runtime Config
Contiene las reglas de URL y el manejo de JWT puro sin importar dependencias de base de datos o bcrypt, lo que evita el error 500 en Vercel.

```typescript
// apps/backoffice/src/auth.config.ts
export const authConfig = {
    session: { strategy: 'jwt' },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            if (nextUrl.pathname.startsWith('/api/auth')) return true
            
            if (isLoggedIn && nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/dashboard', nextUrl))
            }
            if (!isLoggedIn && nextUrl.pathname !== '/login') {
                return Response.redirect(new URL('/login', nextUrl))
            }
            return true
        },
        // ... JWT / Session hooks ...
    }
} satisfies NextAuthConfig
```

### B) Node.js Runtime Config
Agrega el Provider de credenciales, importando `bcryptjs` y la lógica de PostgreSQL. Solo se usa para las rutas de login puras (`/api/auth/*`).

```typescript
// apps/backoffice/src/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig, // Extiende de auth.config
    providers: [
        Credentials({
            async authorize(credentials) {
                const user = await getUserByEmail(credentials.email)
                if (!user) return null

                const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash)
                if (!passwordMatch) return null

                return user // Transforma user a token JWT
            }
        })
    ]
})
```

### Middlewares
El archivo `middleware.ts` en Next 15 App Router en Vercel corre en Edge, por ende solo importamos `authConfig`.

```typescript
// apps/backoffice/src/middleware.ts
import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 🌩️ 4. Deploy en Producción (Vercel)

Toda la plataforma dejó de operarse estrictamente en `localhost` y está vinculada CI/CD de **Vercel** directamente con el repositorio de GitHub. 

### Variables de Entorno (Vercel Configuration)
Para que el entorno remoto funcione idéntico o mejor que el localhost, se definieron estas variables productivas de NextAuth y DB en Vercel:

```env
# URL productiva (evita errores de redirect en callbacks)
AUTH_URL="https://gob-platform-backoffice.vercel.app"

# Secreto para firmar las cookies JWE de sesión en Edge
AUTH_SECRET="GobPlatform_NextAuthSecret_2024"

# Connection Pooling explícito para sortear el error "ENOTFOUND" que da IPv6
DATABASE_URL="postgresql://postgres.xlxjichvzgbcciacsoam:[PASS]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Escalabilidad DNS en Supabase (El problema de IPv6)
Configurar bases de datos conectadas a Edge Functions en Vercel suele tirar errores de DNS debido a que Supabase fuerza conexiones directas (`db.*.supabase.co`) a **IPv6**. La red de Edge de Vercel requiere resolver el proxy mediante **IPv4**.

La solución arquitectónica implementada fue rutear el tráfico a través del **Connection Pooler de Supabase (puerto 6543) anexando `?pgbouncer=true`**, garantizando conectividad en milisegundos sin atascar hilos de conexión.

---

## 🚀 Estado Actual en Producción
* **Repositorio:** Sincronizado (`main`).
* **Vercel Backoffice:** Compilando limpio con Turborepo remote caching.
* **Autenticación (Edge):** Operacional (`https://gob-platform-backoffice.vercel.app/login`), emite y valida JWTs sin Node.js runtime crashes.
* **Database (Supabase):** Recibiendo consultas Drizzle desde los Edge endpoints a través del Pooler IPv4.
