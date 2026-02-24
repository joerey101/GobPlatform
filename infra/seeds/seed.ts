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
    serviceCatalog,
    slaPolicy,
    citizen,
    citizenIdentifier,
    citizenContact,
    address,
    citizenAddress,
    request,
} = schema

function hoursFromNow(hours: number): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000)
}
function hoursAgo(hours: number): Date {
    return new Date(Date.now() - hours * 60 * 60 * 1000)
}

async function main() {
    const pool = new Pool({
        connectionString: process.env['DATABASE_URL']!,
        ssl: { rejectUnauthorized: false },
    })
    const db = drizzle(pool, { schema })

    console.log('🌱 Seeding GobPlatform...\n')

    // ─── 1. Roles ───────────────────────────────────────────────────────────
    console.log('→ Seeding roles...')
    const [roleOperator] = await db.insert(role)
        .values({ name: 'operator', description: 'Agente de atención ciudadana' })
        .onConflictDoNothing().returning()
    const [roleSupervisor] = await db.insert(role)
        .values({ name: 'supervisor', description: 'Supervisor de área' })
        .onConflictDoNothing().returning()
    const [roleAdminRow] = await db.insert(role)
        .values({ name: 'admin', description: 'Administrador de la plataforma' })
        .onConflictDoNothing().returning()
    console.log('  ✅ Roles: operator, supervisor, admin')

    const existingRoleAdmin = roleAdminRow
        ?? await db.query.role.findFirst({ where: eq(role.name, 'admin') })
    const existingRoleOperator = roleOperator
        ?? await db.query.role.findFirst({ where: eq(role.name, 'operator') })

    if (!existingRoleAdmin || !existingRoleOperator) throw new Error('Roles not found')

    // ─── 2. Org units ────────────────────────────────────────────────────────
    console.log('→ Seeding organization units...')
    const [rootOrg] = await db.insert(organizationUnit)
        .values({ name: 'GobPlatform', code: 'ROOT', level: 0 })
        .onConflictDoNothing().returning()

    const existingRoot = rootOrg
        ?? await db.query.organizationUnit.findFirst({ where: eq(organizationUnit.code, 'ROOT') })
    if (!existingRoot) throw new Error('Root org not found')

    const [secGob] = await db.insert(organizationUnit)
        .values({ name: 'Secretaría de Gobierno', code: 'SEC-GOB', parentId: existingRoot.id, level: 1 })
        .onConflictDoNothing().returning()
    const existingSecGob = secGob
        ?? await db.query.organizationUnit.findFirst({ where: eq(organizationUnit.code, 'SEC-GOB') })
    if (!existingSecGob) throw new Error('SecGob not found')
    console.log('  ✅ Org units: ROOT, Secretaría de Gobierno')

    // ─── 3. Internal users ────────────────────────────────────────────────────
    console.log('→ Seeding internal users...')
    const passwordHash = await bcrypt.hash('Admin2024!', 12)
    const [adminUser] = await db.insert(internalUser)
        .values({ email: 'admin@gobplatform.ar', passwordHash, fullName: 'Administrador GobPlatform', orgUnitId: existingSecGob.id })
        .onConflictDoNothing().returning()
    const existingAdmin = adminUser
        ?? await db.query.internalUser.findFirst({ where: eq(internalUser.email, 'admin@gobplatform.ar') })
    if (!existingAdmin) throw new Error('Admin user not found')

    const operaPwHash = await bcrypt.hash('Opera2024!', 12)
    const [operaUser] = await db.insert(internalUser)
        .values({ email: 'operador@gobplatform.ar', passwordHash: operaPwHash, fullName: 'Carlos Mendez', orgUnitId: existingSecGob.id })
        .onConflictDoNothing().returning()
    const existingOpera = operaUser
        ?? await db.query.internalUser.findFirst({ where: eq(internalUser.email, 'operador@gobplatform.ar') })
    console.log('  ✅ Users: admin@gobplatform.ar, operador@gobplatform.ar')

    // ─── 4. User roles ────────────────────────────────────────────────────────
    console.log('→ Asignando roles...')
    await db.insert(userRole).values({ userId: existingAdmin.id, roleId: existingRoleAdmin.id }).onConflictDoNothing()
    if (existingOpera) {
        await db.insert(userRole).values({ userId: existingOpera.id, roleId: existingRoleOperator.id }).onConflictDoNothing()
    }
    console.log('  ✅ Roles asignados')

    // ─── 5. Service catalog ────────────────────────────────────────────────────
    console.log('→ Seeding service catalog...')
    const [svcReclamo] = await db.insert(serviceCatalog)
        .values({ code: 'REC-GEN', name: 'Reclamo General', requestType: 'case', defaultPriority: '3', slaHours: 72, orgUnitId: existingSecGob.id })
        .onConflictDoNothing().returning()
    const [svcPermiso] = await db.insert(serviceCatalog)
        .values({ code: 'PERM-COM', name: 'Permiso Comercial', requestType: 'procedure', defaultPriority: '2', slaHours: 48, orgUnitId: existingSecGob.id })
        .onConflictDoNothing().returning()
    const [svcActualiz] = await db.insert(serviceCatalog)
        .values({ code: 'ACT-DATOS', name: 'Actualización de Datos', requestType: 'procedure', defaultPriority: '4', slaHours: 120, orgUnitId: existingSecGob.id })
        .onConflictDoNothing().returning()

    const svcReclamoId = (svcReclamo ?? await db.query.serviceCatalog.findFirst({ where: eq(serviceCatalog.code, 'REC-GEN') }))!.id
    const svcPermisoId = (svcPermiso ?? await db.query.serviceCatalog.findFirst({ where: eq(serviceCatalog.code, 'PERM-COM') }))!.id
    const svcActualizId = (svcActualiz ?? await db.query.serviceCatalog.findFirst({ where: eq(serviceCatalog.code, 'ACT-DATOS') }))!.id
    console.log('  ✅ Services: Reclamo General, Permiso Comercial, Actualización de Datos')

    // ─── 6. SLA policies ────────────────────────────────────────────────────────
    console.log('→ Seeding SLA policies...')
    const slaPolicies = [
        // Reclamo General
        { serviceId: svcReclamoId, priority: '1' as const, responseHours: 2, resolutionHours: 8, escalationHours: 6 },
        { serviceId: svcReclamoId, priority: '2' as const, responseHours: 4, resolutionHours: 24, escalationHours: 20 },
        { serviceId: svcReclamoId, priority: '3' as const, responseHours: 8, resolutionHours: 72, escalationHours: 60 },
        { serviceId: svcReclamoId, priority: '4' as const, responseHours: 24, resolutionHours: 120, escalationHours: 100 },
        { serviceId: svcReclamoId, priority: '5' as const, responseHours: 48, resolutionHours: 240, escalationHours: 200 },
        // Permiso Comercial
        { serviceId: svcPermisoId, priority: '1' as const, responseHours: 2, resolutionHours: 12, escalationHours: 10 },
        { serviceId: svcPermisoId, priority: '2' as const, responseHours: 4, resolutionHours: 48, escalationHours: 40 },
        { serviceId: svcPermisoId, priority: '3' as const, responseHours: 8, resolutionHours: 96, escalationHours: 80 },
        { serviceId: svcPermisoId, priority: '4' as const, responseHours: 24, resolutionHours: 168, escalationHours: 140 },
        { serviceId: svcPermisoId, priority: '5' as const, responseHours: 48, resolutionHours: 336, escalationHours: 280 },
        // Actualización de Datos
        { serviceId: svcActualizId, priority: '3' as const, responseHours: 24, resolutionHours: 120, escalationHours: 100 },
        { serviceId: svcActualizId, priority: '4' as const, responseHours: 48, resolutionHours: 240, escalationHours: 200 },
        { serviceId: svcActualizId, priority: '5' as const, responseHours: 72, resolutionHours: 480, escalationHours: 400 },
    ]
    for (const sp of slaPolicies) {
        await db.insert(slaPolicy).values(sp).onConflictDoNothing()
    }
    console.log('  ✅ SLA policies creadas (13 reglas)')

    // ─── 7. Citizens ────────────────────────────────────────────────────────────
    console.log('→ Seeding citizens...')
    const citizensData = [
        { fullName: 'María Fernanda González', birthDate: new Date('1985-03-12') },
        { fullName: 'Juan Carlos Rodríguez', birthDate: new Date('1972-08-25') },
        { fullName: 'Ana Laura Martínez', birthDate: new Date('1990-11-05') },
        { fullName: 'Roberto Alejandro Díaz', birthDate: new Date('1968-01-30') },
        { fullName: 'Claudia Patricia Vega', birthDate: new Date('1995-06-18') },
    ]
    const citizensContacts = [
        { email: 'mfgonzalez@gmail.com', phone: '+54 11 4523-7891', street: 'Av. Corrientes', nro: '1234', city: 'CABA', province: 'Capital Federal' },
        { email: 'jcrodriguez@gmail.com', phone: '+54 11 5634-2198', street: 'Rivadavia', nro: '890', city: 'Buenos Aires', province: 'Buenos Aires' },
        { email: 'alamartinez@hotmail.com', phone: '+54 351 4812-3456', street: 'San Martín', nro: '567', city: 'Córdoba', province: 'Córdoba' },
        { email: 'radiaz@gmail.com', phone: '+54 341 4756-3421', street: 'Mitre', nro: '456', city: 'Rosario', province: 'Santa Fe' },
        { email: 'cpvega@yahoo.com', phone: '+54 261 4923-7654', street: 'Belgrano', nro: '234', city: 'Mendoza', province: 'Mendoza' },
    ]

    const insertedCitizens = []
    const dnis = ['24593102', '18456789', '33211789', '12867345', '40125678']
    for (let i = 0; i < citizensData.length; i++) {
        const [c] = await db.insert(citizen).values(citizensData[i]!).onConflictDoNothing().returning()
        if (c) {
            await db.insert(citizenIdentifier).values({
                citizenId: c.id, type: 'dni', number: dnis[i]!, isVerified: true, verifiedAt: new Date()
            }).onConflictDoNothing()

            // 7.1 Contactos
            const contactData = citizensContacts[i]!
            await db.insert(citizenContact).values([
                { citizenId: c.id, type: 'email' as const, value: contactData.email, isPrimary: true, isVerified: true },
                { citizenId: c.id, type: 'phone' as const, value: contactData.phone, isPrimary: false, isVerified: true },
                { citizenId: c.id, type: 'whatsapp' as const, value: contactData.phone, isPrimary: false, isVerified: false },
            ]).onConflictDoNothing()

            // 7.2 Domicilios
            const [addr] = await db.insert(address).values({
                street: contactData.street,
                houseNumber: contactData.nro,
                city: contactData.city,
                province: contactData.province,
            }).onConflictDoNothing().returning()

            if (addr) {
                await db.insert(citizenAddress).values({
                    citizenId: c.id,
                    addressId: addr.id,
                    isPrimary: true,
                }).onConflictDoNothing()
            }

            insertedCitizens.push(c)
        }
    }
    // Fallback si ya existían (para correr el seed múltiples veces)
    if (insertedCitizens.length === 0) {
        const existing = await db.query.citizen.findMany({ orderBy: (citizen, { asc }) => [asc(citizen.createdAt)], limit: 5 })
        insertedCitizens.push(...existing)

        // Agregar info a los existentes, por idempotencia
        for (let i = 0; i < insertedCitizens.length; i++) {
            const c = insertedCitizens[i]!
            const contactData = citizensContacts[i]!
            await db.insert(citizenContact).values([
                { citizenId: c.id, type: 'email' as const, value: contactData.email, isPrimary: true, isVerified: true },
                { citizenId: c.id, type: 'phone' as const, value: contactData.phone, isPrimary: false, isVerified: true },
                { citizenId: c.id, type: 'whatsapp' as const, value: contactData.phone, isPrimary: false, isVerified: false },
            ]).onConflictDoNothing()

            const [addr] = await db.insert(address).values({
                street: contactData.street,
                houseNumber: contactData.nro,
                city: contactData.city,
                province: contactData.province,
            }).onConflictDoNothing().returning()

            if (addr) {
                await db.insert(citizenAddress).values({
                    citizenId: c.id,
                    addressId: addr.id,
                    isPrimary: true,
                }).onConflictDoNothing()
            }
        }
    }
    const [c1, c2, c3, c4, c5] = insertedCitizens
    console.log(`  ✅ ${insertedCitizens.length} ciudadanos actualizados/creados con contactos y direcciones`)

    if (!c1 || !c2) { console.log('⚠️  No hay suficientes ciudadanos para crear requests'); await pool.end(); return }

    // ─── 8. Requests ────────────────────────────────────────────────────────────
    console.log('→ Seeding requests...')
    const requestsData = [
        {
            citizenId: c1.id, serviceId: svcReclamoId, type: 'case' as const,
            status: 'in_progress' as const, priority: '1' as const,
            subject: 'Ruidos molestos en edificio de la calle San Martín 450',
            channel: 'whatsapp' as const,
            assignedUserId: existingAdmin.id,
            createdAt: hoursAgo(10), dueAt: hoursFromNow(1),   // OVERDUE inminente
        },
        {
            citizenId: c2.id, serviceId: svcPermisoId, type: 'procedure' as const,
            status: 'in_progress' as const, priority: '2' as const,
            subject: 'Renovación de Licencia Comercial — Local Av. Corrientes 1234',
            channel: 'web' as const,
            assignedUserId: existingOpera?.id ?? existingAdmin.id,
            createdAt: hoursAgo(36), dueAt: hoursFromNow(8),   // AT RISK
        },
        {
            citizenId: c3?.id ?? c1.id, serviceId: svcReclamoId, type: 'case' as const,
            status: 'pending' as const, priority: '1' as const,
            subject: 'Falta de alumbrado público — Barrio Nueva Esperanza',
            channel: 'email' as const,
            createdAt: hoursAgo(3), dueAt: hoursFromNow(-2),   // OVERDUE
        },
        {
            citizenId: c4?.id ?? c1.id, serviceId: svcActualizId, type: 'procedure' as const,
            status: 'pending' as const, priority: '4' as const,
            subject: 'Actualización de domicilio — Mudanza al barrio Palermo',
            channel: 'web' as const,
            createdAt: hoursAgo(1), dueAt: hoursFromNow(115),  // ON TIME
        },
        {
            citizenId: c5?.id ?? c2.id, serviceId: svcReclamoId, type: 'case' as const,
            status: 'waiting_citizen' as const, priority: '3' as const,
            subject: 'Solicitud de baja de habilitación comercial',
            channel: 'in_person' as const,
            createdAt: hoursAgo(48), dueAt: hoursFromNow(20),  // AT RISK
        },
        {
            citizenId: c1.id, serviceId: svcPermisoId, type: 'procedure' as const,
            status: 'resolved' as const, priority: '3' as const,
            subject: 'Alta de habilitación para lavadero de autos',
            channel: 'web' as const,
            createdAt: hoursAgo(200), dueAt: hoursAgo(50),     // Cerrado
        },
        {
            citizenId: c2.id, serviceId: svcReclamoId, type: 'case' as const,
            status: 'in_progress' as const, priority: '2' as const,
            subject: 'Contenedores de basura desbordados — Manzana 14',
            channel: 'whatsapp' as const,
            assignedUserId: existingAdmin.id,
            createdAt: hoursAgo(20), dueAt: hoursFromNow(4),   // AT RISK
        },
    ]

    for (const r of requestsData) {
        await db.insert(request).values(r).onConflictDoNothing()
    }
    console.log(`  ✅ ${requestsData.length} requests creados`)

    console.log('\n🎉 Seed completado exitosamente!')
    console.log('   Email:    admin@gobplatform.ar')
    console.log('   Password: Admin2024!')
    console.log('   Requests: 7 requests con SLA variados en la bandeja')

    await pool.end()
}

main().catch((err) => {
    console.error('❌ Error en seed:', err)
    process.exit(1)
})
