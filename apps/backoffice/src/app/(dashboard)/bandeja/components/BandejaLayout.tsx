'use client'

import React, { useState } from 'react'
import { RequestList } from './RequestList'
import { RequestDetailPanel } from './RequestDetailPanel'
import { BandejaMetrics } from './BandejaMetrics'

export interface BandejaLayoutProps {
    requests: any[]
    metrics: {
        totalOpen: number
        totalOverdue: number
        totalAtRisk: number
        avgResolutionHours: number
    }
}

export function BandejaLayout({ requests, metrics }: BandejaLayoutProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    return (
        <div className="flex flex-col md:flex-row h-full w-full overflow-hidden bg-white">
            {/* Lista Izquierda Fija */}
            <div className="w-full md:w-[380px] shrink-0 border-r border-slate-200 flex flex-col h-full bg-white z-10">
                <RequestList
                    requests={requests}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    totalCount={metrics.totalOpen}
                />
            </div>

            {/* Panel Derecho Dinámico */}
            <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden relative">
                {selectedId ? (
                    <RequestDetailPanel requestId={selectedId} />
                ) : (
                    <BandejaMetrics metrics={metrics} />
                )}
            </div>
        </div>
    )
}
