'use client'

import React, { useState } from 'react'
import { PriorityIndicator } from '@/components/ui/PriorityIndicator'
import { SLABadge } from '@/components/ui/SLABadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface RequestListProps {
    requests: any[]
    selectedId: string | null
    onSelect: (id: string) => void
    totalCount: number
}

export function RequestList({ requests, selectedId, onSelect, totalCount }: RequestListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    // Filtrar localmente por asunto o nombre de ciudadano
    const filteredRequests = requests.filter(req => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            (req.subject?.toLowerCase() || '').includes(term) ||
            (req.citizenFullName?.toLowerCase() || '').includes(term) ||
            (req.id?.toLowerCase() || '').includes(term)
        )
    })

    return (
        <div className="flex flex-col h-full">
            {/* Header Lista */}
            <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2 mb-4">
                    <h1 className="text-xl font-bold tracking-tight text-[#0A2540]">
                        Bandeja de Entrada
                    </h1>
                    <span className="bg-slate-100 text-[#0A2540] text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                        {totalCount}
                    </span>
                </div>

                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar solicitud, persona..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2c6bc3]/20 focus:border-[#2c6bc3] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Listado scrolleable */}
            <div className="flex-1 overflow-y-auto">
                {filteredRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <p className="text-sm">No se encontraron resultados.</p>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                        {filteredRequests.map((req) => {
                            const isSelected = selectedId === req.id

                            return (
                                <button
                                    key={req.id}
                                    onClick={() => onSelect(req.id)}
                                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors relative flex flex-col gap-2
                                        ${isSelected ? 'bg-[#EFF6FF] hover:bg-[#EFF6FF]' : 'bg-white'}
                                    `}
                                >
                                    {/* Indicador de seleccionado */}
                                    {isSelected && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#2c6bc3]" />
                                    )}

                                    {/* Top Row: Asunto y Fecha */}
                                    <div className="flex justify-between items-start gap-4">
                                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight flex-1">
                                            {req.subject}
                                        </h3>
                                        <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
                                            {req.relativeDate}
                                        </span>
                                    </div>

                                    {/* Metadatos Ciudadano e ID */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                                            {req.citizenFullName}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-wider">
                                            {req.id?.split('-')[0]}
                                        </span>
                                    </div>

                                    {/* Badges Fila */}
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        <StatusBadge status={req.status as any} />
                                        <PriorityIndicator priority={req.priority as any} />
                                        <SLABadge status={req.slaStatus} />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
