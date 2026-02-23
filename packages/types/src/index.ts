// ─── Sesiones ──────────────────────────────────────────────────────────────

export type CitizenSession = {
    citizenId: string
    fullName: string
    email: string
}

export type OperatorSession = {
    userId: string
    fullName: string
    email: string
    orgUnitId: string
    roles: OperatorRole[]
}

// ─── Respuesta de API estándar ──────────────────────────────────────────────

export type ApiResponse<T> =
    | { success: true; data: T }
    | { success: false; error: string; code: string }

// ─── Enums de dominio ───────────────────────────────────────────────────────

export type OperatorRole = 'operator' | 'supervisor' | 'admin'

export type RequestType = 'case' | 'procedure'

export type RequestStatus =
    | 'pending'
    | 'in_progress'
    | 'waiting_citizen'
    | 'waiting_internal'
    | 'resolved'
    | 'closed'
    | 'cancelled'

export type Priority = 1 | 2 | 3 | 4 | 5

export type InteractionChannel = 'whatsapp' | 'phone' | 'email' | 'in_person' | 'web' | 'chatbot'

export type ActorType = 'internal' | 'citizen' | 'system'

export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'download' | 'assign'

export type IdentifierType = 'dni' | 'cuit' | 'cuil' | 'passport' | 'other'

export type ContactType = 'email' | 'phone' | 'whatsapp'

export type RelationType = 'tutor' | 'apoderado' | 'conviviente' | 'conyuge' | 'hijo' | 'other'

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type Gender = 'M' | 'F' | 'X' | 'other'

export type WorkItemStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'
