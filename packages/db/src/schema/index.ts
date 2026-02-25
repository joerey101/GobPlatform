import {
    pgTable,
    text,
    uuid,
    timestamp,
    boolean,
    integer,
    smallint,
    doublePrecision,
    pgEnum,
    unique,
    index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Timestamps helper ──────────────────────────────────────────────────────

const timestamps = {
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

// ─── Enums ──────────────────────────────────────────────────────────────────

export const genderEnum = pgEnum('gender', ['M', 'F', 'X', 'other'])
export const identifierTypeEnum = pgEnum('identifier_type', [
    'dni',
    'cuit',
    'cuil',
    'passport',
    'other',
])
export const contactTypeEnum = pgEnum('contact_type', ['email', 'phone', 'whatsapp'])
export const relationTypeEnum = pgEnum('relation_type', [
    'tutor',
    'apoderado',
    'conviviente',
    'conyuge',
    'hijo',
    'other',
])
export const roleNameEnum = pgEnum('role_name', ['operator', 'supervisor', 'admin'])
export const requestTypeEnum = pgEnum('request_type', ['case', 'procedure'])
export const requestStatusEnum = pgEnum('request_status', [
    'pending',
    'in_progress',
    'waiting_citizen',
    'waiting_internal',
    'resolved',
    'closed',
    'cancelled',
])
export const priorityEnum = pgEnum('priority', ['1', '2', '3', '4', '5'])
export const interactionChannelEnum = pgEnum('interaction_channel', [
    'whatsapp',
    'phone',
    'email',
    'in_person',
    'web',
    'chatbot',
])
export const actorTypeEnum = pgEnum('actor_type', ['internal', 'citizen', 'system'])
export const auditActionEnum = pgEnum('audit_action', [
    'create',
    'update',
    'delete',
    'view',
    'download',
    'assign',
    'accept',
    'reject',
])
export const notificationStatusEnum = pgEnum('notification_status', [
    'pending',
    'sent',
    'delivered',
    'read',
    'failed',
])
export const workItemStatusEnum = pgEnum('work_item_status', [
    'pending',
    'in_progress',
    'done',
    'cancelled',
])

export const aiRunStatusEnum = pgEnum('ai_run_status', ['succeeded', 'failed'])
export const aiSuggestionTypeEnum = pgEnum('ai_suggestion_type', ['classification', 'priority', 'draft_reply'])
export const aiSuggestionStatusEnum = pgEnum('ai_suggestion_status', ['proposed', 'accepted', 'rejected', 'edited'])

// ═══════════════════════════════════════════════════════════════════════════
// IDENTIDAD Y PERFIL ÚNICO DEL CIUDADANO (7 tablas)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * citizen — Entidad maestra de la persona
 */
export const citizen = pgTable('citizen', {
    id: uuid('id').primaryKey().defaultRandom(),
    fullName: text('full_name').notNull(),
    birthDate: timestamp('birth_date', { withTimezone: true }),
    gender: genderEnum('gender'),
    notes: text('notes'),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
})

/**
 * citizen_identifier — DNI, CUIT, pasaporte (UNIQUE type+number)
 */
export const citizenIdentifier = pgTable(
    'citizen_identifier',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        citizenId: uuid('citizen_id')
            .notNull()
            .references(() => citizen.id, { onDelete: 'cascade' }),
        type: identifierTypeEnum('type').notNull(),
        number: text('number').notNull(),
        isVerified: boolean('is_verified').notNull().default(false),
        verifiedAt: timestamp('verified_at', { withTimezone: true }),
        ...timestamps,
    },
    (t) => [unique().on(t.type, t.number)]
)

/**
 * citizen_contact — Teléfonos, emails, WhatsApp verificados
 */
export const citizenContact = pgTable('citizen_contact', {
    id: uuid('id').primaryKey().defaultRandom(),
    citizenId: uuid('citizen_id')
        .notNull()
        .references(() => citizen.id, { onDelete: 'cascade' }),
    type: contactTypeEnum('type').notNull(),
    value: text('value').notNull(),
    isPrimary: boolean('is_primary').notNull().default(false),
    isVerified: boolean('is_verified').notNull().default(false),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    ...timestamps,
})

/**
 * address — Direcciones normalizadas con lat/lon (USIG-ready)
 */
export const address = pgTable('address', {
    id: uuid('id').primaryKey().defaultRandom(),
    street: text('street').notNull(),
    houseNumber: text('house_number'),
    floor: text('floor'),
    apartment: text('apartment'),
    neighborhood: text('neighborhood'),
    city: text('city').notNull(),
    province: text('province').notNull().default('Buenos Aires'),
    postalCode: text('postal_code'),
    lat: doublePrecision('lat'),
    lon: doublePrecision('lon'),
    normalizedAddress: text('normalized_address'),
    ...timestamps,
})

/**
 * citizen_address — Relación ciudadano↔domicilio (histórica)
 */
export const citizenAddress = pgTable('citizen_address', {
    id: uuid('id').primaryKey().defaultRandom(),
    citizenId: uuid('citizen_id')
        .notNull()
        .references(() => citizen.id, { onDelete: 'cascade' }),
    addressId: uuid('address_id')
        .notNull()
        .references(() => address.id),
    isPrimary: boolean('is_primary').notNull().default(false),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull().defaultNow(),
    validTo: timestamp('valid_to', { withTimezone: true }),
    ...timestamps,
})

/**
 * citizen_relation — Vínculos entre ciudadanos
 */
export const citizenRelation = pgTable('citizen_relation', {
    id: uuid('id').primaryKey().defaultRandom(),
    citizenId: uuid('citizen_id')
        .notNull()
        .references(() => citizen.id, { onDelete: 'cascade' }),
    relatedCitizenId: uuid('related_citizen_id')
        .notNull()
        .references(() => citizen.id, { onDelete: 'cascade' }),
    relationType: relationTypeEnum('relation_type').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    notes: text('notes'),
    ...timestamps,
})

/**
 * consent — Permisos de contacto y uso de datos
 */
export const consent = pgTable('consent', {
    id: uuid('id').primaryKey().defaultRandom(),
    citizenId: uuid('citizen_id')
        .notNull()
        .references(() => citizen.id, { onDelete: 'cascade' }),
    consentType: text('consent_type').notNull(), // 'marketing', 'data_processing', 'contact_whatsapp', etc.
    granted: boolean('granted').notNull().default(false),
    grantedAt: timestamp('granted_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    ipAddress: text('ip_address'),
    ...timestamps,
})

/**
 * citizen_auth — Credenciales de acceso al Portal Vecinal
 */
export const citizenAuth = pgTable('citizen_auth', {
    id: uuid('id').primaryKey().defaultRandom(),
    citizenId: uuid('citizen_id')
        .notNull()
        .unique()
        .references(() => citizen.id, { onDelete: 'cascade' }),
    cuil: text('cuil').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    ...timestamps,
})

// ═══════════════════════════════════════════════════════════════════════════
// ORGANIZACIÓN DEL ESTADO (5 tablas)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * organization_unit — Organismos, áreas, sedes (árbol jerárquico self-FK)
 */
export const organizationUnit = pgTable('organization_unit', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    code: text('code').unique(),
    description: text('description'),
    parentId: uuid('parent_id'), // FK a sí misma — se declara en relations
    level: integer('level').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
})

/**
 * internal_user — Agentes y funcionarios del Estado
 */
export const internalUser = pgTable('internal_user', {
    id: uuid('id').primaryKey().defaultRandom(),
    orgUnitId: uuid('org_unit_id')
        .notNull()
        .references(() => organizationUnit.id),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    fullName: text('full_name').notNull(),
    phone: text('phone'),
    avatarUrl: text('avatar_url'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    ...timestamps,
})

/**
 * role — Roles del sistema
 */
export const role = pgTable('role', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: roleNameEnum('name').notNull().unique(),
    description: text('description'),
    ...timestamps,
})

/**
 * user_role — Asignación N:N usuario↔rol con alcance opcional
 */
export const userRole = pgTable('user_role', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => internalUser.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
        .notNull()
        .references(() => role.id, { onDelete: 'cascade' }),
    orgUnitScopeId: uuid('org_unit_scope_id').references(() => organizationUnit.id),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
})

/**
 * service_catalog — Catálogo de trámites/servicios (la "tabla de verdad")
 * Todo request DEBE tener un service_id válido aquí
 */
export const serviceCatalog = pgTable('service_catalog', {
    id: uuid('id').primaryKey().defaultRandom(),
    orgUnitId: uuid('org_unit_id').references(() => organizationUnit.id),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    requestType: requestTypeEnum('request_type').notNull(),
    defaultPriority: priorityEnum('default_priority').notNull().default('3'),
    slaHours: integer('sla_hours'), // horas máximas permitidas
    requiresDocuments: boolean('requires_documents').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
})

// ═══════════════════════════════════════════════════════════════════════════
// DEMANDA CIUDADANA — NÚCLEO OPERATIVO (6 tablas)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * request — Objeto unificador de toda demanda (caso o trámite)
 * REGLA DE ORO: serviceId NUNCA puede ser null
 */
export const request = pgTable(
    'request',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        citizenId: uuid('citizen_id')
            .notNull()
            .references(() => citizen.id),
        serviceId: uuid('service_id')
            .notNull()
            .references(() => serviceCatalog.id),
        assignedOrgUnitId: uuid('assigned_org_unit_id').references(() => organizationUnit.id),
        assignedUserId: uuid('assigned_user_id').references(() => internalUser.id),
        type: requestTypeEnum('type').notNull(),
        status: requestStatusEnum('status').notNull().default('pending'),
        priority: priorityEnum('priority').notNull().default('3'),
        subject: text('subject').notNull(),
        description: text('description'),
        channel: interactionChannelEnum('channel').notNull().default('web'),
        resolvedAt: timestamp('resolved_at', { withTimezone: true }),
        closedAt: timestamp('closed_at', { withTimezone: true }),
        dueAt: timestamp('due_at', { withTimezone: true }),
        ...timestamps,
    },
    (t) => [
        index('idx_request_citizen').on(t.citizenId),
        index('idx_request_status').on(t.status),
        index('idx_request_assigned_user').on(t.assignedUserId),
        index('idx_request_due').on(t.dueAt),
    ]
)

/**
 * case — Reclamo/consulta/incidente (1:1 con request cuando type=case)
 */
export const caseTable = pgTable('case', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
        .notNull()
        .unique()
        .references(() => request.id, { onDelete: 'cascade' }),
    caseNumber: text('case_number').notNull().unique(),
    resolution: text('resolution'),
    rootCause: text('root_cause'),
    ...timestamps,
})

/**
 * procedure — Trámite formal con pasos (1:1 con request cuando type=procedure)
 */
export const procedure = pgTable('procedure', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
        .notNull()
        .unique()
        .references(() => request.id, { onDelete: 'cascade' }),
    procedureNumber: text('procedure_number').notNull().unique(),
    currentStep: integer('current_step').notNull().default(1),
    totalSteps: integer('total_steps').notNull().default(1),
    stepsJson: text('steps_json'), // JSON con el detalle de cada paso
    ...timestamps,
})

/**
 * interaction — Cada contacto por canal (WhatsApp, llamada, mail, presencial)
 */
export const interaction = pgTable(
    'interaction',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        requestId: uuid('request_id').references(() => request.id, { onDelete: 'cascade' }),
        citizenId: uuid('citizen_id').references(() => citizen.id),
        userId: uuid('user_id').references(() => internalUser.id),
        channel: interactionChannelEnum('channel').notNull(),
        direction: text('direction').notNull().default('inbound'), // 'inbound' | 'outbound'
        content: text('content'),
        attachmentsJson: text('attachments_json'), // JSON array de storage_urls
        durationSeconds: integer('duration_seconds'),
        ...timestamps,
    },
    (t) => [index('idx_interaction_request').on(t.requestId)]
)

/**
 * work_item — Tareas internas asignadas a organismos/usuarios
 */
export const workItem = pgTable(
    'work_item',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        requestId: uuid('request_id')
            .notNull()
            .references(() => request.id, { onDelete: 'cascade' }),
        assignedUserId: uuid('assigned_user_id').references(() => internalUser.id),
        assignedOrgUnitId: uuid('assigned_org_unit_id').references(() => organizationUnit.id),
        title: text('title').notNull(),
        description: text('description'),
        status: workItemStatusEnum('status').notNull().default('pending'),
        dueAt: timestamp('due_at', { withTimezone: true }),
        completedAt: timestamp('completed_at', { withTimezone: true }),
        ...timestamps,
    },
    (t) => [index('idx_work_item_request').on(t.requestId)]
)

/**
 * assignment_history — Historial de enrutamiento y derivaciones
 */
export const assignmentHistory = pgTable('assignment_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
        .notNull()
        .references(() => request.id, { onDelete: 'cascade' }),
    fromUserId: uuid('from_user_id').references(() => internalUser.id),
    toUserId: uuid('to_user_id').references(() => internalUser.id),
    fromOrgUnitId: uuid('from_org_unit_id').references(() => organizationUnit.id),
    toOrgUnitId: uuid('to_org_unit_id').references(() => organizationUnit.id),
    reason: text('reason'),
    createdById: uuid('created_by_id').references(() => internalUser.id),
    ...timestamps,
})

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTACIÓN Y AUDITORÍA (6 tablas)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * document — Metadatos de archivos (storage_url apunta a Supabase Storage)
 */
export const document = pgTable('document', {
    id: uuid('id').primaryKey().defaultRandom(),
    citizenId: uuid('citizen_id').references(() => citizen.id),
    uploadedByUserId: uuid('uploaded_by_user_id').references(() => internalUser.id),
    storageUrl: text('storage_url').notNull(),
    fileName: text('file_name').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes'),
    description: text('description'),
    ...timestamps,
})

/**
 * request_document — Adjuntos vinculados a casos/trámites
 */
export const requestDocument = pgTable('request_document', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id')
        .notNull()
        .references(() => request.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
        .notNull()
        .references(() => document.id, { onDelete: 'cascade' }),
    role: text('role'), // 'evidence', 'citizen_upload', 'operator_upload', etc.
    ...timestamps,
})

/**
 * sla_policy — Tiempos máximos por servicio y prioridad
 */
export const slaPolicy = pgTable(
    'sla_policy',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        serviceId: uuid('service_id').references(() => serviceCatalog.id, { onDelete: 'cascade' }),
        priority: priorityEnum('priority').notNull(),
        responseHours: integer('response_hours').notNull(),
        resolutionHours: integer('resolution_hours').notNull(),
        escalationHours: integer('escalation_hours'),
        isActive: boolean('is_active').notNull().default(true),
        ...timestamps,
    },
    (t) => [unique().on(t.serviceId, t.priority)]
)

/**
 * notification — Comunicaciones oficiales con acuse de entrega/lectura
 */
export const notification = pgTable(
    'notification',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        citizenId: uuid('citizen_id')
            .notNull()
            .references(() => citizen.id, { onDelete: 'cascade' }),
        requestId: uuid('request_id').references(() => request.id),
        channel: contactTypeEnum('channel').notNull(),
        subject: text('subject'),
        body: text('body').notNull(),
        status: notificationStatusEnum('status').notNull().default('pending'),
        sentAt: timestamp('sent_at', { withTimezone: true }),
        deliveredAt: timestamp('delivered_at', { withTimezone: true }),
        readAt: timestamp('read_at', { withTimezone: true }),
        externalId: text('external_id'), // ID de proveedor (Resend, Twilio, etc.)
        ...timestamps,
    },
    (t) => [index('idx_notification_citizen').on(t.citizenId)]
)

/**
 * survey_response — Satisfacción ciudadana (CSAT/NPS)
 */
export const surveyResponse = pgTable('survey_response', {
    id: uuid('id').primaryKey().defaultRandom(),
    requestId: uuid('request_id').references(() => request.id),
    citizenId: uuid('citizen_id').references(() => citizen.id),
    surveyType: text('survey_type').notNull().default('CSAT'), // 'CSAT' | 'NPS'
    score: smallint('score').notNull(), // 1-5 para CSAT, 0-10 para NPS
    comment: text('comment'),
    ...timestamps,
})

/**
 * audit_event — Bitácora inalterable de quién hizo qué y cuándo
 * REGLA: toda mutación relevante DEBE insertar aquí
 */
export const auditEvent = pgTable(
    'audit_event',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        actorUserId: uuid('actor_user_id').references(() => internalUser.id),
        actorCitizenId: uuid('actor_citizen_id').references(() => citizen.id),
        actorType: actorTypeEnum('actor_type').notNull(),
        entityType: text('entity_type').notNull(), // 'request', 'citizen', 'document', etc.
        entityId: uuid('entity_id').notNull(),
        action: auditActionEnum('action').notNull(),
        ip: text('ip'),
        userAgent: text('user_agent'),
        metadataJson: text('metadata_json'), // JSON con contexto adicional
        createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    },
    (t) => [
        index('idx_audit_entity').on(t.entityType, t.entityId),
        index('idx_audit_actor_user').on(t.actorUserId),
        index('idx_audit_created').on(t.createdAt),
    ]
)

// ═══════════════════════════════════════════════════════════════════════════
// INTELIGENCIA ARTIFICIAL (3 tablas)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ai_model — Catálogo de modelos LLM utilizados
 */
export const aiModel = pgTable('ai_model', {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(), // 'anthropic', 'openai', etc.
    name: text('name').notNull(), // 'claude-sonnet-4'
    version: text('version').notNull(), // '20250514'
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
}, (t) => [unique().on(t.provider, t.name, t.version)])

/**
 * ai_run — Registro de ejecución y trazabilidad del LLM
 */
export const aiRun = pgTable('ai_run', {
    id: uuid('id').primaryKey().defaultRandom(),
    purpose: text('purpose').notNull().default('classify+suggest'),
    requestId: uuid('request_id').references(() => request.id, { onDelete: 'cascade' }),
    citizenId: uuid('citizen_id').references(() => citizen.id),
    serviceId: uuid('service_id').references(() => serviceCatalog.id),
    modelId: uuid('model_id').notNull().references(() => aiModel.id),
    status: aiRunStatusEnum('status').notNull().default('succeeded'),
    inputHash: text('input_hash'), // Hash del prompt
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    ...timestamps,
})

/**
 * ai_suggestion — Sugerencias atómicas generadas en un run
 */
export const aiSuggestion = pgTable('ai_suggestion', {
    id: uuid('id').primaryKey().defaultRandom(),
    runId: uuid('run_id').notNull().references(() => aiRun.id, { onDelete: 'cascade' }),
    suggestionType: aiSuggestionTypeEnum('suggestion_type').notNull(),
    payloadJson: text('payload_json').notNull(), // La sugerencia en sí (JSON stringificado)
    confidence: doublePrecision('confidence'), // 0.0 - 1.0
    status: aiSuggestionStatusEnum('status').notNull().default('proposed'),
    ...timestamps,
})

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONS (Drizzle relational queries)
// ═══════════════════════════════════════════════════════════════════════════

export const citizenRelations = relations(citizen, ({ one, many }) => ({
    identifiers: many(citizenIdentifier),
    contacts: many(citizenContact),
    addresses: many(citizenAddress),
    relationsFrom: many(citizenRelation, { relationName: 'from' }),
    relationsTo: many(citizenRelation, { relationName: 'to' }),
    consents: many(consent),
    requests: many(request),
    interactions: many(interaction),
    notifications: many(notification),
    auth: one(citizenAuth, { fields: [citizen.id], references: [citizenAuth.citizenId] }),
}))

export const citizenAuthRelations = relations(citizenAuth, ({ one }) => ({
    citizen: one(citizen, { fields: [citizenAuth.citizenId], references: [citizen.id] }),
}))

export const citizenRelationRelations = relations(citizenRelation, ({ one }) => ({
    citizen: one(citizen, { fields: [citizenRelation.citizenId], references: [citizen.id], relationName: 'from' }),
    relatedCitizen: one(citizen, { fields: [citizenRelation.relatedCitizenId], references: [citizen.id], relationName: 'to' }),
}))

export const organizationUnitRelations = relations(organizationUnit, ({ one, many }) => ({
    parent: one(organizationUnit, { fields: [organizationUnit.parentId], references: [organizationUnit.id], relationName: 'children' }),
    children: many(organizationUnit, { relationName: 'children' }),
    users: many(internalUser),
    services: many(serviceCatalog),
}))

export const internalUserRelations = relations(internalUser, ({ one, many }) => ({
    orgUnit: one(organizationUnit, { fields: [internalUser.orgUnitId], references: [organizationUnit.id] }),
    roles: many(userRole),
    assignedRequests: many(request),
}))

export const requestRelations = relations(request, ({ one, many }) => ({
    citizen: one(citizen, { fields: [request.citizenId], references: [citizen.id] }),
    service: one(serviceCatalog, { fields: [request.serviceId], references: [serviceCatalog.id] }),
    assignedUser: one(internalUser, { fields: [request.assignedUserId], references: [internalUser.id] }),
    case: one(caseTable),
    procedure: one(procedure),
    interactions: many(interaction),
    workItems: many(workItem),
    documents: many(requestDocument),
    notifications: many(notification),
    assignmentHistory: many(assignmentHistory),
    aiRuns: many(aiRun),
}))

export const aiRunRelations = relations(aiRun, ({ one, many }) => ({
    request: one(request, { fields: [aiRun.requestId], references: [request.id] }),
    model: one(aiModel, { fields: [aiRun.modelId], references: [aiModel.id] }),
    suggestions: many(aiSuggestion),
}))

export const aiSuggestionRelations = relations(aiSuggestion, ({ one }) => ({
    run: one(aiRun, { fields: [aiSuggestion.runId], references: [aiRun.id] }),
}))
