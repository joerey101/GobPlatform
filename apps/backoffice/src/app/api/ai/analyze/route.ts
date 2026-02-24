import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db, request, caseTable, citizen, serviceCatalog } from '@repo/db'
import { eq } from 'drizzle-orm'
import { getOrInsertAiModel, createAiRun, insertAiSuggestions, markAiRunFailed, markAiRunEnded } from '@/lib/queries/ai-queries'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { requestId } = await req.json()
        if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })

        // 1. Fetch relevant context
        const reqData = await db
            .select({
                channel: request.channel,
                serviceId: request.serviceId,
                citizenId: request.citizenId,
                subject: request.subject,
                description: request.description,
                caseSummary: caseTable.resolution,
                citizenFullName: citizen.fullName,
                serviceName: serviceCatalog.name,
            })
            .from(request)
            .leftJoin(caseTable, eq(caseTable.requestId, request.id))
            .innerJoin(citizen, eq(request.citizenId, citizen.id))
            .innerJoin(serviceCatalog, eq(request.serviceId, serviceCatalog.id))
            .where(eq(request.id, requestId))
            .limit(1)

        if (!reqData.length) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

        const ctx = reqData[0]!

        // 2. Prepare System Prompt & Tracing
        const modelId = await getOrInsertAiModel()
        const runId = await createAiRun({
            requestId,
            citizenId: ctx.citizenId,
            serviceId: ctx.serviceId,
            modelId,
            purpose: 'classify+suggest',
        })

        const systemPrompt = `Sos un asistente de clasificación para el sistema de gestión gubernamental GobPlatform. Respondé ÚNICAMENTE en JSON válido sin markdown ni backticks ni comentarios.`
        const userPrompt = `Analizá este caso y devolvé un JSON con esta estructura exacta:
      {
        "classification": {
          "service_name": "nombre del servicio sugerido",
          "reason": "razón breve en español",
          "confidence": 0.98,
          "alternative": "clasificación alternativa",
          "alternative_confidence": 0.45
        },
        "priority": {
          "level": 2,
          "label": "Alta",
          "reason": "razón breve en español",
          "confidence": 0.87
        },
        "draft_response": {
          "formal": "texto formal completo en español",
          "standard": "texto estándar completo en español", 
          "direct": "texto directo completo en español"
        }
      }
      
      Caso a analizar:
      Servicio Actual: ${ctx.serviceName}
      Título: ${ctx.subject}
      Resumen: ${ctx.caseSummary || 'Sin resumen'}
      Detalles: ${ctx.description || 'Sin detalles'}
      Canal de origen: ${ctx.channel}
      Ciudadano: ${ctx.citizenFullName}`

        // 3. Call Claude API
        const anthropicKey = process.env.ANTHROPIC_API_KEY
        if (!anthropicKey) {
            await markAiRunFailed(runId)
            throw new Error('ANTHROPIC_API_KEY not configured')
        }

        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "claude-3-5-sonnet-20241022", // updated to actual model identifier normally used by Anthropic
                max_tokens: 1500,
                system: systemPrompt,
                messages: [{ role: "user", content: userPrompt }]
            })
        })

        if (!claudeRes.ok) {
            await markAiRunFailed(runId)
            const errStr = await claudeRes.text()
            console.error('Claude API Error:', errStr)
            return NextResponse.json({ error: 'AI provider failed' }, { status: 502 })
        }

        const claudeData = await claudeRes.json()
        const textResponse = claudeData.content?.[0]?.text

        let parsed: any
        try {
            parsed = JSON.parse(textResponse)
        } catch (e) {
            await markAiRunFailed(runId)
            console.error('Claude JSON Parse Error:', textResponse)
            return NextResponse.json({ error: 'AI provider returned invalid JSON' }, { status: 502 })
        }

        // 4. Save to DB
        const savedSuggestions = await insertAiSuggestions(runId, [
            {
                type: 'classification',
                payloadJson: JSON.stringify(parsed.classification),
                confidence: parsed.classification?.confidence,
            },
            {
                type: 'priority',
                payloadJson: JSON.stringify(parsed.priority),
                confidence: parsed.priority?.confidence,
            },
            {
                type: 'draft_reply',
                payloadJson: JSON.stringify(parsed.draft_response),
                confidence: 0.9, // Drafts generally have high confidence organically, no strict metric provided by model prompt
            }
        ])

        await markAiRunEnded(runId)

        return NextResponse.json({
            ok: true,
            runId,
            suggestions: savedSuggestions.map((s, idx) => ({
                id: s.id,
                type: s.type,
                payload: [parsed.classification, parsed.priority, parsed.draft_response][idx],
                confidence: s.type === 'draft_reply' ? 0.9 : (s.type === 'classification' ? parsed.classification.confidence : parsed.priority.confidence)
            }))
        })

    } catch (error: any) {
        console.error('AI Analyze error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
