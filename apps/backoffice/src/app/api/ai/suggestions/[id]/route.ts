import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db, aiSuggestion, auditEvent } from '@repo/db'
import { eq } from '@repo/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        const sessionUserId = (session as any)?.id || null

        if (!sessionUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params
        const { status, editedPayload } = await req.json()

        if (!['accepted', 'rejected', 'edited'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const currSug = await db
            .select()
            .from(aiSuggestion)
            .where(eq(aiSuggestion.id, id))
            .limit(1)

        if (!currSug.length) return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 })

        const updateData: any = { status, updatedAt: new Date() }
        if (editedPayload && status === 'edited') {
            updateData.payloadJson = JSON.stringify(editedPayload)
        }

        await db.transaction(async (tx) => {
            await tx.update(aiSuggestion)
                .set(updateData)
                .where(eq(aiSuggestion.id, id))

            await tx.insert(auditEvent).values({
                actorUserId: sessionUserId,
                actorType: 'internal',
                entityType: 'ai_suggestion',
                entityId: id,
                action: status === 'rejected' ? 'reject' : (status === 'edited' ? 'update' : 'accept'),
            })
        })

        return NextResponse.json({ ok: true })

    } catch (error: any) {
        console.error('AI Suggestion update error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
