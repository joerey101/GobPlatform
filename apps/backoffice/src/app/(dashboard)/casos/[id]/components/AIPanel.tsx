'use client'

import { useState, useEffect } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'

type SuggestionItem = {
    id: string
    type: 'classification' | 'priority' | 'draft_reply'
    payload: any
    confidence?: number
}

function AIPanelSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded w-full"></div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="h-24 bg-slate-100 rounded w-full"></div>
            </div>
        </div>
    )
}

function ConfidenceBar({ confidence }: { confidence: number }) {
    const value = Math.round(confidence * 100)
    let color = 'bg-red-500'
    if (value >= 80) color = 'bg-emerald-500'
    else if (value > 50) color = 'bg-amber-500'

    return (
        <div className="flex items-center gap-2 mt-2 w-full">
            <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-slate-500">{value}%</span>
        </div>
    )
}

export function AIPanel({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
    const [runId, setRunId] = useState<string | null>(null)

    // Draft tone state
    const [draftTone, setDraftTone] = useState<'formal' | 'standard' | 'direct'>('standard')
    const [editableDraft, setEditableDraft] = useState('')

    // Action states
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

    const fetchAnalysis = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Error fetching AI analysis')
            setRunId(data.runId)
            setSuggestions(data.suggestions || [])

            const draft = data.suggestions?.find((s: any) => s.type === 'draft_reply')?.payload
            if (draft) setEditableDraft(draft[draftTone])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalysis()
    }, [requestId])

    useEffect(() => {
        const draftSug = suggestions.find(s => s.type === 'draft_reply')
        if (draftSug && draftSug.payload) {
            setEditableDraft(draftSug.payload[draftTone])
        }
    }, [draftTone])

    const handleAction = async (id: string, status: 'accepted' | 'rejected' | 'edited', payloadOverride?: any) => {
        setActionLoadingId(id)
        try {
            const res = await fetch(`/api/ai/suggestions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, editedPayload: payloadOverride })
            })
            if (!res.ok) throw new Error('Error saving action')

            // Remove from list visually on success (or optionally mark it as processed)
            setSuggestions(prev => prev.filter(s => s.id !== id))
        } catch (err) {
            console.error(err)
            alert('No se pudo guardar la decisión.')
        } finally {
            setActionLoadingId(null)
        }
    }

    if (loading) return <AIPanelSkeleton />

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-100 rounded-xl text-center">
                <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
                <p className="text-red-700 text-sm font-medium mb-4">{error}</p>
                <button onClick={fetchAnalysis} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 font-medium">Reintentar</button>
            </div>
        )
    }

    if (!suggestions.length) {
        return <div className="text-sm text-slate-500 italic p-4 text-center">No hay sugerencias disponibles.</div>
    }

    const classif = suggestions.find(s => s.type === 'classification')
    const prio = suggestions.find(s => s.type === 'priority')
    const draft = suggestions.find(s => s.type === 'draft_reply')

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-purple-600 animate-pulse">auto_awesome</span>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Motor GobAI Beta</span>
            </div>

            {/* Clasificación */}
            {classif && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Clasificación Sugerida</h3>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium text-slate-800">
                            <span className="material-symbols-outlined text-[18px] text-purple-600">account_balance</span>
                            {classif.payload.service_name}
                        </div>
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded mt-1 border border-slate-100">{classif.payload.reason}</p>
                        <ConfidenceBar confidence={classif.confidence!} />
                    </div>
                    {classif.payload.alternative && (
                        <p className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                            Alt: {classif.payload.alternative} ({Math.round(classif.payload.alternative_confidence * 100)}%)
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button disabled={actionLoadingId === classif.id} onClick={() => handleAction(classif.id, 'accepted')} className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">check</span> Aceptar
                        </button>
                        <button disabled={actionLoadingId === classif.id} onClick={() => handleAction(classif.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1 bg-slate-50 text-slate-500 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 disabled:opacity-50 border border-slate-200">
                            <span className="material-symbols-outlined text-[14px]">close</span> Rechazar
                        </button>
                    </div>
                </div>
            )}

            {/* Prioridad */}
            {prio && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prioridad Sugerida</h3>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${prio.payload.level <= 2 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                            P{prio.payload.level} — {prio.payload.label}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">{prio.payload.reason}</p>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button disabled={actionLoadingId === prio.id} onClick={() => handleAction(prio.id, 'accepted')} className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 text-emerald-700 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">check</span> Aceptar
                        </button>
                        <button disabled={actionLoadingId === prio.id} onClick={() => handleAction(prio.id, 'rejected')} className="flex-1 flex items-center justify-center gap-1 bg-slate-50 text-slate-500 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 disabled:opacity-50 border border-slate-200">
                            <span className="material-symbols-outlined text-[14px]">close</span> Rechazar
                        </button>
                    </div>
                </div>
            )}

            {/* Borrador Respuesta */}
            {draft && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Borrador de Respuesta</h3>
                        <button onClick={fetchAnalysis} className="text-[#2c6bc3] text-[10px] font-bold uppercase hover:underline flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">refresh</span>
                            Regenerar
                        </button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-3">
                        {['formal', 'standard', 'direct'].map((tone) => (
                            <button
                                key={tone}
                                onClick={() => setDraftTone(tone as any)}
                                className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-all ${draftTone === tone ? 'bg-white text-[#2c6bc3] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {tone === 'formal' ? 'Formal' : tone === 'standard' ? 'Estándar' : 'Directo'}
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={editableDraft}
                        onChange={e => setEditableDraft(e.target.value)}
                        className="w-full h-32 p-3 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#2c6bc3]/20 focus:border-[#2c6bc3] transition-all"
                    />

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        <button disabled={actionLoadingId === draft.id} onClick={() => {
                            const isEdited = editableDraft !== draft.payload[draftTone]
                            handleAction(draft.id, isEdited ? 'edited' : 'accepted', isEdited ? { ...draft.payload, [draftTone]: editableDraft } : undefined)
                        }} className="w-full flex items-center justify-center gap-2 bg-[#2c6bc3] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#1A4B8F] disabled:opacity-50 shadow-sm transition-colors">
                            <span className="material-symbols-outlined text-[16px]">send</span> Usar Borrador
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-4 border-t border-slate-200 pt-4 text-center">
                <p className="text-[10px] text-slate-400 px-4 leading-relaxed italic">
                    Las sugerencias son generadas automáticamente y de carácter orientativo. El operador es responsable de la validación y decisión final.
                </p>
            </div>
        </div>
    )
}
