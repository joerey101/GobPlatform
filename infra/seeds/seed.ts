import 'dotenv/config'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import * as schema from '../../packages/db/src/schema/index'

const {
    role,
    organizationUnit,
    internalUser,
    userRole,
} = schema

async function main() {
    const pool = new Pool({
        connectionString: process.env['DATABASE_URL']!,
        ssl: { rejectUnauthorized: false },
    })
    const db = drizzle(pool, { schema })

    console.log('🌱 Seeding GobPlatform...\n')

    // 1. Roles
    console.log('→ Seeding roles...')
    const [roleOperator] = await db
        .insert(role)
        .values({ name: 'operator', description: 'Agente de atención ciudadana' })
        .onConflictDoNothing()
        .returning()
    const [roleSupervisor] = await db
        .insert(role)
        .values({ name: 'supervisor', description: 'Supervisor de área' })
        .onConflictDoNothing()
        .returning()
    const [roleAdmin] = await db
        .insert(role)
        .values({ name: 'admin', description: 'Administrador de la plataforma' })
        .onConflictDoNothing()
        .returning()
    console.log('  ✅ Roles creados: operator, supervisor, admin')

    // 2. Org unit raíz
    console.log('→ Seeding organization_unit raíz...')
    const [rootOrg] = await db
        .insert(organizationUnit)
        .values({
            name: 'GobPlatform',
            code: 'ROOT',
            description: 'Unidad organizativa raíz del sistema',
            level: 0,
        })
        .onConflictDoNothing()
        .returning()
    console.log('  ✅ Org unit raíz: GobPlatform (ROOT)')

    // Si ya existían, obtenerlos
    const existingRole = roleAdmin ?? await db.query.role.findFirst({ where: eq(role.name, 'admin') })
    const existingOrg = rootOrg ?? await db.query.organizationUnit.findFirst({ where: eq(organizationUnit.code, 'ROOT') })

    if (!existingRole || !existingOrg) {
        throw new Error('No se pudieron obtener role o org_unit raíz')
    }

    // 3. Usuario admin
    console.log('→ Seeding usuario admin...')
    const passwordHash = await bcrypt.hash('Admin2024!', 12)
    const [adminUser] = await db
        .insert(internalUser)
        .values({
            email: 'admin@gobplatform.ar',
            passwordHash,
            fullName: 'Administrador GobPlatform',
            orgUnitId: existingOrg.id,
            isActive: true,
        })
        .onConflictDoNothing()
        .returning()

    const existingAdmin = adminUser ?? await db.query.internalUser.findFirst({
        where: eq(internalUser.email, 'admin@gobplatform.ar')
    })

    if (!existingAdmin) throw new Error('No se pudo crear el usuario admin')
    console.log('  ✅ Admin: admin@gobplatform.ar / Admin2024!')

    // 4. Asignar rol admin al usuario
    console.log('→ Asignando rol admin...')
    await db
        .insert(userRole)
        .values({
            userId: existingAdmin.id,
            roleId: existingRole.id,
        })
        .onConflictDoNothing()
    console.log('  ✅ Rol admin asignado')

    console.log('\n🎉 Seed completado exitosamente!')
    console.log('   Email:    admin@gobplatform.ar')
    console.log('   Password: Admin2024!')
    console.log('   Org:      GobPlatform (ROOT)')

    await pool.end()
}

main().catch((err) => {
    console.error('❌ Error en seed:', err)
    process.exit(1)
})
