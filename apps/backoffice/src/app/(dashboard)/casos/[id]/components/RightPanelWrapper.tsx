'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CaseActionsPanel } from './CaseActionsPanel'
import { AIPanel } from './AIPanel'

export function RightPanelWrapper({
    detailId,
    status,
    orgUnits,
    users,
    documents
}: {
    detailId: string
    status: string
    orgUnits: any[]
    users: any[]
    documents: any[]
}) {
    const [activeTab, setActiveTab] = useState<'operations' | 'ai'>('operations')

    return (
        <div className="flex flex-col h-full">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('operations')}
                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'operations' ? 'border-[#2c6bc3] text-[#2c6bc3]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}
                    `}
                >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    Operaciones
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'ai' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}
                    `}
                >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    GobAI <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full ml-1">BETA</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'operations' ? (
                    <div className="flex flex-col h-full">
                        <CaseActionsPanel
                            requestId={detailId}
                            currentStatus={status}
                            orgUnits={orgUnits}
                            users={users}
                        />

                        <div className="mt-6 border-t border-slate-200 pt-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">folder_open</span>
                                Documentos ({documents.length})
                            </h3>
                            <div className="flex flex-col gap-2">
                                {documents.length > 0 ? (
                                    documents.map((doc: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="material-symbols-outlined text-[#2c6bc3] bg-blue-50 p-1 rounded">description</span>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-700 truncate">{doc.fileName}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase">{doc.role || 'archivo'} • {(doc.sizeBytes! / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button className="text-slate-400 hover:text-[#2c6bc3] p-1.5 rounded-md hover:bg-slate-50 transition-colors" title="Descargar">
                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No hay documentos adjuntos.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-8 pb-2">
                            <Link
                                href={`/dashboard/bandeja/${detailId}`}
                                className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-900 py-2 rounded-lg transition-colors font-medium border border-transparent hover:border-slate-300 hover:bg-white text-sm"
                            >
                                <span className="material-symbols-outlined text-[18px]">person</span>
                                Ver perfil del ciudadano
                            </Link>
                        </div>
                    </div>
                ) : (
                    <AIPanel requestId={detailId} />
                )}
            </div>
        </div>
    )
}
