import Link from 'next/link'
import { SLABadge } from '@/components/ui/SLABadge'
import { PriorityIndicator } from '@/components/ui/PriorityIndicator'
import { StatusBadge } from '@/components/ui/StatusBadge'

// Mock data — se reemplazará con queries Drizzle cuando los datos estén listos
const requests = [
    {
        id: 'REQ-001',
        subject: 'Solicitud de permiso comercial - Zona Norte',
        priority: 'p1' as const,
        sla: 'overdue' as const,
        status: 'in_progress' as const,
        date: 'Hace 2h',
        selected: false,
    },
    {
        id: 'REQ-002',
        subject: 'Renovación de licencia de conducir',
        priority: 'p2' as const,
        sla: 'at_risk' as const,
        status: 'open' as const,
        date: 'Hace 5h',
        selected: true,
    },
    {
        id: 'REQ-003',
        subject: 'Consulta sobre impuesto predial',
        priority: 'p3' as const,
        sla: 'on_time' as const,
        status: 'closed' as const,
        date: 'Ayer',
        selected: false,
    },
    {
        id: 'REQ-004',
        subject: 'Denuncia anónima - Ruidos molestos',
        priority: 'p1' as const,
        sla: 'at_risk' as const,
        status: 'on_hold' as const,
        date: 'Ayer',
        selected: false,
    },
    {
        id: 'REQ-005',
        subject: 'Actualización de domicilio',
        priority: 'p4' as const,
        sla: 'on_time' as const,
        status: 'open' as const,
        date: '2 días',
        selected: false,
    },
    {
        id: 'REQ-2023-8942',
        subject: 'Renovación de Licencia Comercial',
        priority: 'p1' as const,
        sla: 'overdue' as const,
        status: 'in_progress' as const,
        date: 'Hace 2 horas',
        selected: false,
    },
    {
        id: 'REQ-2023-8941',
        subject: 'Subsidio Habitacional Tipo A',
        priority: 'p2' as const,
        sla: 'at_risk' as const,
        status: 'open' as const,
        date: 'Ayer',
        selected: false,
    },
]

export default function BandejaPage() {
    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Main work area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-slate-900">Bandeja de Entrada</h1>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                            {requests.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm
                                    focus:outline-none focus:ring-2 w-64 transition-all placeholder-slate-400"
                                placeholder="Buscar solicitud, DNI..."
                                type="text"
                            />
                        </div>
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors" title="Filtrar">
                            <span className="material-symbols-outlined">filter_list</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors" title="Actualizar">
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </header>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 w-12">
                                    <input className="rounded border-slate-300" type="checkbox" />
                                </th>
                                <th className="px-6 py-3">ID / Asunto</th>
                                <th className="px-6 py-3">Prioridad</th>
                                <th className="px-6 py-3">SLA</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Fecha</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {requests.map((req) => (
                                <tr
                                    key={req.id}
                                    className={`cursor-pointer transition-colors group
                                        ${req.selected
                                            ? 'bg-blue-50/60 border-l-4 border-l-primary relative'
                                            : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            className="rounded border-slate-300"
                                            type="checkbox"
                                            defaultChecked={req.selected}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{req.id}</span>
                                            <span className="text-slate-500 text-xs truncate max-w-[220px]">{req.subject}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <PriorityIndicator priority={req.priority} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <SLABadge status={req.sla} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">{req.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Right panel — Citizen 360° */}
            <aside className="w-[380px] bg-slate-50 border-l border-slate-200 flex flex-col shrink-0">
                {/* Tabs */}
                <div className="bg-white border-b border-slate-200 px-2 pt-2">
                    <div className="flex items-center gap-1 overflow-x-auto">
                        {['Ciudadano', 'Caso', 'IA', 'Docs', 'Notif'].map((tab, i) => (
                            <button
                                key={tab}
                                className={`px-4 py-2.5 text-sm rounded-t-lg transition-colors
                                    ${i === 0
                                        ? 'font-semibold border-b-2 border-primary bg-blue-50/50'
                                        : 'font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                    }`}
                                style={i === 0 ? { color: '#2c6bc3', borderColor: '#2c6bc3' } : {}}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Citizen avatar + info */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-3">
                            <div className="size-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                                <span className="material-symbols-outlined text-slate-400 text-5xl">person</span>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                <span className="material-symbols-outlined text-blue-500 text-xl" title="Verificado">
                                    verified
                                </span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 text-center">María Fernanda González</h2>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-base">badge</span>
                            DNI: 24.593.102
                        </p>
                        <div className="flex gap-2 mt-4">
                            {['mail', 'call', 'chat'].map(icon => (
                                <button
                                    key={icon}
                                    className="flex items-center justify-center size-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-colors"
                                    style={{ '--hover-color': '#2c6bc3' } as React.CSSProperties}
                                >
                                    <span className="material-symbols-outlined text-lg">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-slate-200 mb-6" />

                    {/* Timeline */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
                            Línea de Tiempo
                        </h3>
                        <div className="space-y-6 relative pl-2">
                            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-200" />

                            {/* WA message */}
                            <div className="relative flex gap-4">
                                <div className="relative z-10 flex items-center justify-center size-12 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm mt-1">
                                    <span className="text-[#25D366]">
                                        <svg fill="currentColor" height="20" width="20" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
                                        </svg>
                                    </span>
                                </div>
                                <div className="flex flex-col pt-1.5 w-full">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-slate-900">Mensaje entrante</span>
                                        <span className="text-xs text-slate-400">10:42 AM</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 bg-white p-2 rounded border border-slate-100">
                                        &ldquo;Hola, quería consultar sobre el estado de mi trámite REQ-002, ¿necesitan más documentos?&rdquo;
                                    </p>
                                    <div className="mt-2 flex gap-2">
                                        <button className="text-xs font-medium hover:underline" style={{ color: '#2c6bc3' }}>Responder</button>
                                        <button className="text-xs font-medium text-slate-500 hover:text-slate-700">Archivar</button>
                                    </div>
                                </div>
                            </div>

                            {/* Email notification */}
                            <div className="relative flex gap-4">
                                <div className="relative z-10 flex items-center justify-center size-12 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm mt-1">
                                    <span className="material-symbols-outlined text-slate-500 text-xl">mail</span>
                                </div>
                                <div className="flex flex-col pt-1.5 w-full">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-slate-900">Notificación automática</span>
                                        <span className="text-xs text-slate-400">Ayer</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Cambio de estado: De &quot;Pendiente&quot; a &quot;Abierto&quot;. Se ha asignado un agente al caso.
                                    </p>
                                </div>
                            </div>

                            {/* Portal creation */}
                            <div className="relative flex gap-4">
                                <div className="relative z-10 flex items-center justify-center size-12 shrink-0 rounded-full bg-white border border-slate-200 shadow-sm mt-1">
                                    <span className="material-symbols-outlined text-xl" style={{ color: '#2c6bc3' }}>language</span>
                                </div>
                                <div className="flex flex-col pt-1.5 w-full">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-slate-900">Solicitud creada</span>
                                        <span className="text-xs text-slate-400">Hace 2 días</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Usuario inició el trámite a través del Portal Web GobPlatform.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action footer */}
                <div className="p-4 border-t border-slate-200 bg-white">
                    <button
                        className="w-full py-2.5 px-4 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#2c6bc3' }}
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Nueva Acción
                    </button>
                </div>
            </aside>
        </div>
    )
}
