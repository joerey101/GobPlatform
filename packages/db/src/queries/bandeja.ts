import { db } from '../client'
import { request, citizen, serviceCatalog, slaPolicy, internalUser } from '../schema/index'
import { eq, desc, asc } from 'drizzle-orm'

// ─── SLA Status helper ────────────────────────────────────────────────────

export type SlaStatus = 'on_time' | 'at_risk' | 'overdue'

export function computeSlaStatus(dueAt: Date | null, resolutionHours: number): SlaStatus {
    if (!dueAt) return 'on_time'
    const now = Date.now()
    const due = dueAt.getTime()
    const warningBuffer = resolutionHours * 0.2 * 60 * 60 * 1000 // 20% of resolution time in ms
    if (now >= due) return 'overdue'
    if (now >= due - warningBuffer) return 'at_risk'
    return 'on_time'
}

// ─── Query ────────────────────────────────────────────────────────────────

export type BandejaRow = {
    id: string
    subject: string
    status: string
    priority: string
    channel: string
    dueAt: Date | null
    createdAt: Date
    slaStatus: SlaStatus
    resolutionHours: number
    citizenFullName: string
    citizenId: string
    serviceName: string
    serviceCode: string
    assignedUserFullName: string | null
}

export async function getRequests(limit = 50): Promise<BandejaRow[]> {
    const rows = await db
        .select({
            id: request.id,
            subject: request.subject,
            status: request.status,
            priority: request.priority,
            channel: request.channel,
            dueAt: request.dueAt,
            createdAt: request.createdAt,
            citizenFullName: citizen.fullName,
            citizenId: citizen.id,
            serviceName: serviceCatalog.name,
            serviceCode: serviceCatalog.code,
            slaPolicyResolutionHours: slaPolicy.resolutionHours,
            assignedUserFullName: internalUser.fullName,
        })
        .from(request)
        .innerJoin(citizen, eq(request.citizenId, citizen.id))
        .innerJoin(serviceCatalog, eq(request.serviceId, serviceCatalog.id))
        .leftJoin(
            slaPolicy,
            eq(slaPolicy.serviceId, request.serviceId)
        )
        .leftJoin(internalUser, eq(request.assignedUserId, internalUser.id))
        .orderBy(asc(request.dueAt), desc(request.createdAt))
        .limit(limit)

    // De-dup: cada request puede tener múltiples sla_policy rows (una por priority).
    // Nos quedamos con la que coincide con la priority del request.
    const seen = new Set<string>()
    const deduped = rows.filter(r => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
    })

    return deduped.map(r => ({
        id: r.id,
        subject: r.subject,
        status: r.status,
        priority: r.priority,
        channel: r.channel,
        dueAt: r.dueAt,
        createdAt: r.createdAt,
        slaStatus: computeSlaStatus(r.dueAt, r.slaPolicyResolutionHours ?? 72),
        resolutionHours: r.slaPolicyResolutionHours ?? 72,
        citizenFullName: r.citizenFullName,
        citizenId: r.citizenId,
        serviceName: r.serviceName,
        serviceCode: r.serviceCode,
        assignedUserFullName: r.assignedUserFullName ?? null,
    }))
}
