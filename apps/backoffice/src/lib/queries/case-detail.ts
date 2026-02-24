import { db } from '@repo/db'
import {
    request,
    caseTable,
    citizen,
    serviceCatalog,
    organizationUnit,
    slaPolicy,
    workItem,
    assignmentHistory,
    requestDocument,
    document,
    internalUser,
} from '@repo/db'
import { eq, desc, asc } from 'drizzle-orm'

export async function fetchCaseDetail(requestId: string) {
    const reqRows = await db
        .select({
            id: request.id,
            status: request.status,
            priority: request.priority,
            createdAt: request.createdAt,
            channel: request.channel,
            dueAt: request.dueAt,
            serviceId: request.serviceId,

            // case
            caseSummary: caseTable.resolution,
            subject: request.subject,
            description: request.description,

            // citizen
            citizenFullName: citizen.fullName,
            citizenId: citizen.id,

            // service catalog
            serviceName: serviceCatalog.name,

            // current organization unit
            orgUnitName: organizationUnit.name,
            orgUnitId: organizationUnit.id,

            // sla
            resolutionHours: slaPolicy.resolutionHours,
        })
        .from(request)
        .leftJoin(caseTable, eq(caseTable.requestId, request.id))
        .innerJoin(citizen, eq(request.citizenId, citizen.id))
        .innerJoin(serviceCatalog, eq(request.serviceId, serviceCatalog.id))
        .leftJoin(organizationUnit, eq(request.assignedOrgUnitId, organizationUnit.id))
        .leftJoin(slaPolicy, eq(slaPolicy.serviceId, request.serviceId))
        .where(eq(request.id, requestId))
        .limit(1)

    if (reqRows.length === 0) return null
    const reqData = reqRows[0]!

    // 2. Fetch work items (Tareas) - Ordenados por dueAt ASC
    const workItems = await db
        .select({
            id: workItem.id,
            title: workItem.title,
            description: workItem.description,
            status: workItem.status,
            dueAt: workItem.dueAt,
            completedAt: workItem.completedAt,
            assignedUserFullName: internalUser.fullName,
            assignedOrgUnitName: organizationUnit.name,
        })
        .from(workItem)
        .leftJoin(internalUser, eq(workItem.assignedUserId, internalUser.id))
        .leftJoin(organizationUnit, eq(workItem.assignedOrgUnitId, organizationUnit.id))
        .where(eq(workItem.requestId, requestId))
        .orderBy(asc(workItem.createdAt))

    // 3. Fetch assignment history (Derivaciones)
    const assignments = await db
        .select({
            id: assignmentHistory.id,
            reason: assignmentHistory.reason,
            createdAt: assignmentHistory.createdAt,
            fromOrgUnitName: organizationUnit.name, // ToDo: resolve aliases for from/to cleanly.
            createdByName: internalUser.fullName,
        })
        // En Drizzle, mutiples joins a la misma tabla requieren alias, por simplicidad obtenemos el basic data.
        // Implementación con alias:
        .from(assignmentHistory)
        .leftJoin(internalUser, eq(assignmentHistory.createdById, internalUser.id))
        .where(eq(assignmentHistory.requestId, requestId))
        .orderBy(desc(assignmentHistory.createdAt))

    // Note: To cleanly resolve from/to org names, we will fetch the organization units and map them.
    const allOrgUnits = await db.select({ id: organizationUnit.id, name: organizationUnit.name }).from(organizationUnit)
    const orgMap = Object.fromEntries(allOrgUnits.map(o => [o.id, o.name]))

    const assignmentsWithOrgs = await db
        .select({
            id: assignmentHistory.id,
            reason: assignmentHistory.reason,
            createdAt: assignmentHistory.createdAt,
            fromOrgUnitId: assignmentHistory.fromOrgUnitId,
            toOrgUnitId: assignmentHistory.toOrgUnitId,
            createdByName: internalUser.fullName,
        })
        .from(assignmentHistory)
        .leftJoin(internalUser, eq(assignmentHistory.createdById, internalUser.id))
        .where(eq(assignmentHistory.requestId, requestId))
        .orderBy(desc(assignmentHistory.createdAt))

    const mappedAssignments = assignmentsWithOrgs.map(a => ({
        ...a,
        fromOrgUnitName: a.fromOrgUnitId ? orgMap[a.fromOrgUnitId] : null,
        toOrgUnitName: a.toOrgUnitId ? orgMap[a.toOrgUnitId] : null,
    }))

    // 4. Fetch Documents
    const documents = await db
        .select({
            id: document.id,
            fileName: document.fileName,
            mimeType: document.mimeType,
            sizeBytes: document.sizeBytes,
            storageUrl: document.storageUrl,
            role: requestDocument.role,
        })
        .from(requestDocument)
        .innerJoin(document, eq(requestDocument.documentId, document.id))
        .where(eq(requestDocument.requestId, requestId))

    return {
        ...reqData,
        workItems,
        assignments: mappedAssignments,
        documents,
    }
}
