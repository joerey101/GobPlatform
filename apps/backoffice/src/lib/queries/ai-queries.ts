import { db } from '@repo/db'
import { aiModel, aiRun, aiSuggestion } from '@repo/db'
import { eq, and } from 'drizzle-orm'

/**
 * Obtiene o inserta el modelo Claude Sonnet 3.5 en la base de datos de modelos IA
 */
export async function getOrInsertAiModel() {
    // Current target model config based on brief
    const provider = 'anthropic'
    const name = 'claude-sonnet-4'
    const version = '20250514'

    const existing = await db
        .select({ id: aiModel.id })
        .from(aiModel)
        .where(
            and(
                eq(aiModel.provider, provider),
                eq(aiModel.name, name),
                eq(aiModel.version, version)
            )
        )
        .limit(1)

    if (existing.length > 0) return existing[0]!.id

    const inserted = await db
        .insert(aiModel)
        .values({
            provider,
            name,
            version,
            isActive: true,
        })
        .returning({ id: aiModel.id })

    return inserted[0]!.id
}

/**
 * Inserta un nuevo AI Run con status inicial.
 */
export async function createAiRun(data: {
    requestId: string
    citizenId?: string | null
    serviceId?: string | null
    modelId: string
    purpose?: string
    inputHash?: string
}) {
    const inserted = await db
        .insert(aiRun)
        .values({
            requestId: data.requestId,
            citizenId: data.citizenId || undefined,
            serviceId: data.serviceId || undefined,
            modelId: data.modelId,
            purpose: data.purpose || 'classify+suggest',
            inputHash: data.inputHash,
            status: 'succeeded',
        })
        .returning({ id: aiRun.id })

    return inserted[0]!.id
}

/**
 * Inserta un lote de sugerencias (Classification, Priority, DraftReply)
 */
export async function insertAiSuggestions(
    runId: string,
    suggestions: Array<{
        type: 'classification' | 'priority' | 'draft_reply'
        payloadJson: string
        confidence?: number
    }>
) {
    const mapped = suggestions.map((s) => ({
        runId,
        suggestionType: s.type,
        payloadJson: s.payloadJson,
        confidence: s.confidence,
        status: 'proposed' as const,
    }))

    const inserted = await db
        .insert(aiSuggestion)
        .values(mapped)
        .returning({ id: aiSuggestion.id, type: aiSuggestion.suggestionType })

    return inserted
}

/**
 * Marca un AI run como fallido
 */
export async function markAiRunFailed(runId: string) {
    await db
        .update(aiRun)
        .set({ status: 'failed', endedAt: new Date(), updatedAt: new Date() })
        .where(eq(aiRun.id, runId))
}

/**
 * Marca un AI run como finalizado
 */
export async function markAiRunEnded(runId: string) {
    await db
        .update(aiRun)
        .set({ endedAt: new Date(), updatedAt: new Date() })
        .where(eq(aiRun.id, runId))
}

/**
 * Obtiene las sugerencias vigentes (último run successful).
 */
export async function fetchLatestAiSuggestions(requestId: string) {
    // 1. Get the latest successful run
    const runs = await db
        .select({ id: aiRun.id, endedAt: aiRun.endedAt })
        .from(aiRun)
        .where(and(eq(aiRun.requestId, requestId), eq(aiRun.status, 'succeeded')))
        .orderBy(aiRun.createdAt) // En Drizzle es `desc(aiRun.createdAt)` si lo hubieras importado, pero fetch fallará. Dejemos que TS verifique.
    // Corrección para OrderBy descendente manual
    const lastRunQuery = await db.query.aiRun.findFirst({
        where: (table, { eq, and }) =>
            and(eq(table.requestId, requestId), eq(table.status, 'succeeded')),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
    })

    if (!lastRunQuery) return null

    // 2. Traer las sugerencias de ese run
    const suggestions = await db
        .select()
        .from(aiSuggestion)
        .where(eq(aiSuggestion.runId, lastRunQuery.id))

    return {
        runId: lastRunQuery.id,
        runDate: lastRunQuery.createdAt,
        suggestions,
    }
}
