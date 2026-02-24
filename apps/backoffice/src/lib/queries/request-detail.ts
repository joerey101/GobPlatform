import { db } from '@repo/db'
import {
    request,
    caseTable,
    citizen,
    citizenIdentifier,
    citizenContact,
    citizenAddress,
    address,
    serviceCatalog,
    organizationUnit,
    slaPolicy,
    interaction,
    internalUser,
} from '@repo/db'
import { eq, desc, and } from '@repo/db'

export async function fetchRequestDetail(requestId: string) {
    // Definir la query principal en un builder para obtener 1 fila real
    const reqRows = await db
        .select({
            id: request.id,
            status: request.status,
            priority: request.priority,
            channel: request.channel,
            createdAt: request.createdAt,
            closedAt: request.closedAt,
            dueAt: request.dueAt,

            // case details
            caseSummary: caseTable.resolution, // o de request.subject (lo traemos también por las dudas)
            subject: request.subject,
            description: request.description,

            // citizen details
            citizenId: citizen.id,
            citizenFullName: citizen.fullName,
            citizenBirthDate: citizen.birthDate,

            // DNI (el primero si lo tiene)
            citizenDni: citizenIdentifier.number,

            // Service y Org
            serviceName: serviceCatalog.name,
            orgUnitName: organizationUnit.name,

            // SLA
            resolutionHours: slaPolicy.resolutionHours,

            // Reasignado / Operador
            assignedUserFullName: internalUser.fullName,
        })
        .from(request)
        .leftJoin(caseTable, eq(caseTable.requestId, request.id))
        .innerJoin(citizen, eq(request.citizenId, citizen.id))
        .leftJoin(
            citizenIdentifier,
            and(eq(citizenIdentifier.citizenId, citizen.id), eq(citizenIdentifier.type, 'dni'))
        )
        .innerJoin(serviceCatalog, eq(request.serviceId, serviceCatalog.id))
        .leftJoin(organizationUnit, eq(serviceCatalog.orgUnitId, organizationUnit.id))
        .leftJoin(slaPolicy, eq(slaPolicy.serviceId, request.serviceId))
        .leftJoin(internalUser, eq(request.assignedUserId, internalUser.id))
        .where(eq(request.id, requestId))
        .limit(1)

    if (reqRows.length === 0) return null

    const reqData = reqRows[0]!

    // 2. Fetch de contactos del ciudadano
    const contacts = await db
        .select({
            type: citizenContact.type,
            value: citizenContact.value,
            isPrimary: citizenContact.isPrimary,
        })
        .from(citizenContact)
        .where(eq(citizenContact.citizenId, reqData.citizenId))

    // 3. Fetch de su dirección (domicilio activo/principal)
    const addresses = await db
        .select({
            street: address.street,
            houseNumber: address.houseNumber,
            city: address.city,
            province: address.province,
            normalizedAddress: address.normalizedAddress
        })
        .from(citizenAddress)
        .innerJoin(address, eq(citizenAddress.addressId, address.id))
        .where(eq(citizenAddress.citizenId, reqData.citizenId))
        // idealmente con un default a isActive o isPrimary si lo hubiera
        .limit(1)

    // 4. Fetch de la línea de tiempo (interacciones)
    const interactions = await db
        .select({
            id: interaction.id,
            channel: interaction.channel,
            direction: interaction.direction,
            content: interaction.content,
            durationSeconds: interaction.durationSeconds,
            createdAt: interaction.createdAt,
            userName: internalUser.fullName,
        })
        .from(interaction)
        .leftJoin(internalUser, eq(interaction.userId, internalUser.id))
        .where(eq(interaction.requestId, requestId))
        .orderBy(desc(interaction.createdAt))

    return {
        ...reqData,
        contacts,
        address: addresses.length > 0 ? addresses[0] : null,
        interactions,
    }
}
