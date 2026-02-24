'use client'

import React from 'react'

interface BandejaMetricsProps {
    metrics: {
        totalOpen: number
        totalOverdue: number
        totalAtRisk: number
        avgResolutionHours: number
    }
}

export function BandejaMetrics({ metrics }: BandejaMetricsProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center fade-in">
            <div className="w-full max-w-2xl">

                {/* Ícono central */}
                <div className="mb-6 inline-flex items-center justify-center size-20 rounded-full bg-blue-50 text-[#2c6bc3] shadow-sm border border-blue-100">
                    <span className="material-symbols-outlined text-4xl">monitoring</span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-[#0A2540] mb-2">
                    Resumen Operativo
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-12">
                    Seleccioná una solicitud del listado lateral para ver su detalle, línea de tiempo y asistir mediante Inteligencia Artificial.
                </p>

                {/* Grid de Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    {/* Tarjeta 1 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-1 hover:border-blue-200 transition-colors">
                        <span className="text-3xl font-black text-slate-800 tracking-tight">
                            {metrics.totalOpen}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                            Solicitudes Abiertas
                        </span>
                    </div>

                    {/* Tarjeta 2 */}
                    <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center justify-center gap-1 hover:border-red-200 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                        </div>
                        <span className="text-3xl font-black text-red-600 tracking-tight relative z-10">
                            {metrics.totalOverdue}
                        </span>
                        <span className="text-xs font-semibold text-red-500 uppercase tracking-wider text-center relative z-10">
                            SLA Vencido
                        </span>
                    </div>

                    {/* Tarjeta 3 */}
                    <div className="bg-white p-5 rounded-2xl border border-yellow-100 shadow-sm flex flex-col items-center justify-center gap-1 hover:border-yellow-200 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-4xl text-yellow-500">schedule</span>
                        </div>
                        <span className="text-3xl font-black text-yellow-600 tracking-tight relative z-10">
                            {metrics.totalAtRisk}
                        </span>
                        <span className="text-xs font-semibold text-yellow-600/70 uppercase tracking-wider text-center relative z-10">
                            SLA en Riesgo
                        </span>
                    </div>

                    {/* Tarjeta 4 */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-1 hover:border-slate-300 transition-colors">
                        <span className="text-3xl font-black text-slate-700 tracking-tight">
                            {metrics.avgResolutionHours}
                            <span className="text-base text-slate-400 ml-1">hs</span>
                        </span>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                            T.M. Resolución
                        </span>
                    </div>

                </div>
            </div>
        </div>
    )
}
