'use client'

import React, { useState } from 'react'
import { AIPanel } from '../../casos/[id]/components/AIPanel'
import { CitizenAvatar } from '@/components/ui/CitizenAvatar'
import { ChannelBadge } from '@/components/ui/ChannelBadge'
import { PriorityIndicator } from '@/components/ui/PriorityIndicator'
import { SLABadge } from '@/components/ui/SLABadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
// Note: en un entorno reactivo preferiríamos SWR o React Query. 
// Aquí usaremos un useEffect simple por simplicidad y dependencia nula extra.

interface RequestTabsProps {
    detail: any
}

export function RequestTabs({ detail }: RequestTabsProps) {
    const [activeTab, setActiveTab] = useState<'ciudadano' | 'caso' | 'ia'>('ciudadano')

    // Dummy UI para el WorkflowStepper y otros elementos pre-existentes 
    // en la vista de Caso (acá solo lo mostraremos de forma resumida para el brief)

    return (
        <div className="flex flex-col h-full fade-in">
            {/* Cabecera / Pestañas */}
            <div className="flex items-center border-b border-slate-200 bg-white sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('ciudadano')}
                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'ciudadano' ? 'border-[#2c6bc3] text-[#2c6bc3]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                    `}
                >
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Ciudadano
                </button>
                <button
                    onClick={() => setActiveTab('caso')}
                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'caso' ? 'border-[#2c6bc3] text-[#2c6bc3]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                    `}
                >
                    <span className="material-symbols-outlined text-[18px]">folder_open</span>
                    Caso
                </button>
                <button
                    onClick={() => setActiveTab('ia')}
                    className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2
                        ${activeTab === 'ia' ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                    `}
                >
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    IA Sugerencias
                </button>
            </div>

            {/* Contenido Pestañas */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* 1. PESTAÑA CIUDADANO */}
                {activeTab === 'ciudadano' && (
                    <div className="flex flex-col gap-6 fade-in max-w-2xl mx-auto">
                        <div className="flex flex-col items-center text-center p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                            <CitizenAvatar
                                size="xl"
                                fullName={detail.citizenFullName}
                                dni={detail.citizenDni}
                            />
                            <h2 className="mt-4 text-xl font-bold text-slate-800 tracking-tight">
                                {detail.citizenFullName}
                            </h2>
                            <p className="text-sm font-medium text-slate-400 font-mono mt-1">
                                DNI {detail.citizenDni}
                            </p>

                            <div className="mt-6 flex justify-center gap-3 w-full">
                                <button className="flex-1 flex flex-col items-center justify-center py-2 px-3 border border-slate-200 rounded-lg hover:border-[#2c6bc3] hover:bg-blue-50 transition-colors group">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#2c6bc3] mb-1">call</span>
                                    <span className="text-xs font-semibold text-slate-600">
                                        {detail.contacts?.find((c: any) => c.type === 'phone')?.value || 'No registrado'}
                                    </span>
                                </button>
                                <button className="flex-1 flex flex-col items-center justify-center py-2 px-3 border border-slate-200 rounded-lg hover:border-[#2c6bc3] hover:bg-blue-50 transition-colors group">
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#2c6bc3] mb-1">mail</span>
                                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]" title={detail.contacts?.find((c: any) => c.type === 'email')?.value}>
                                        {detail.contacts?.find((c: any) => c.type === 'email')?.value || 'No registrado'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-lg">home_pin</span>
                                Domicilio Registrado
                            </h3>
                            <div className="text-sm text-slate-600 pl-[26px]">
                                <p className="font-semibold text-slate-800">
                                    {detail.address ? `${detail.address.street} ${detail.address.houseNumber || ''}` : 'Sin calle'}
                                </p>
                                <p>{detail.address?.city || 'Sin ciudad'}, {detail.address?.province || ''}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. PESTAÑA CASO */}
                {activeTab === 'caso' && (
                    <div className="flex flex-col gap-6 fade-in max-w-2xl mx-auto">

                        <div className="flex items-center gap-3">
                            <StatusBadge status={detail.status as any} />
                            <PriorityIndicator priority={detail.priority as any} />
                            <SLABadge status={detail.slaStatus} />
                            <ChannelBadge channel={detail.channel as any} />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h2 className="text-xl font-bold text-[#0A2540] mb-2 leading-tight">
                                {detail.subject}
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                {detail.description || 'Sin descripción detallada proporcionada por el ciudadano.'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 px-2">Info Adicional</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Servicio</p>
                                    <p className="text-sm font-medium text-slate-700">{detail.serviceName}</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Asignado A</p>
                                    <p className="text-sm font-medium text-slate-700">{detail.assignedUserFullName || 'Sin Asignar'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. PESTAÑA IA */}
                {activeTab === 'ia' && (
                    <div className="fade-in max-w-2xl mx-auto">
                        <AIPanel requestId={detail.id} />
                    </div>
                )}

            </div>
        </div>
    )
}

export function RequestDetailPanel({ requestId }: { requestId: string }) {
    const [detail, setDetail] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

    React.useEffect(() => {
        let isMounted = true

        async function fetchDetail() {
            setLoading(true)
            setError(null)
            try {
                // Minimum loading skeleton feel UX logic
                await delay(200)

                const res = await fetch(`/api/requests/${requestId}`)
                const data = await res.json()

                if (!res.ok) throw new Error(data.error || 'Fetch failed')
                if (isMounted) setDetail(data)
            } catch (err: any) {
                if (isMounted) setError(err.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        if (requestId) {
            fetchDetail()
        }

        return () => { isMounted = false }
    }, [requestId])

    if (loading) {
        return (
            <div className="flex-1 flex flex-col p-8 gap-6 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-lg w-1/3" />
                <div className="h-32 bg-slate-200 rounded-xl w-full" />
                <div className="h-64 bg-slate-200 rounded-xl w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-red-400 mb-2">error</span>
                    <p className="text-slate-800 font-medium">{error}</p>
                </div>
            </div>
        )
    }

    if (!detail) return null

    return <RequestTabs detail={detail} />
}
