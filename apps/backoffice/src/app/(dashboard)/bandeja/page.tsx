import Link from 'next/link'
import { db } from '@repo/db'
import {
    request,
    citizen,
    serviceCatalog,
    slaPolicy,
    internalUser,
} from '@repo/db'
import { eq, asc, desc } from 'drizzle-orm'
import { SLABadge } from '@/components/ui/SLABadge'
import { PriorityIndicator } from '@/components/ui/PriorityIndicator'
import { StatusBadge } from '@/components/ui/StatusBadge'

// ─── SLA runtime helper ─────────────────────────────────────────────────────
type SlaStatus = 'on_time' | 'at_risk' | 'overdue'

function computeSlaStatus(dueAt: Date | null, resolutionHours: number): SlaStatus {
    if (!dueAt) return 'on_time'
    const now = Date.now()
    const due = dueAt.getTime()
    const warningBuffer = resolutionHours * 0.2 * 60 * 60 * 1000
    if (now >= due) return 'overdue'
    if (now >= due - warningBuffer) return 'at_risk'
    return 'on_time'
}

function formatRelativeTime(date: Date): string {
    const diffMs = Date.now() - date.getTime()
    const diffH = Math.floor(diffMs / 3_600_000)
    const diffD = Math.floor(diffH / 24)
    if (diffH < 1) return 'Hace momentos'
    if (diffH < 24) return `Hace ${diffH}h`
    if (diffD === 1) return 'Ayer'
    return `Hace ${diffD} días`
}

function priorityLabel(p: string): string {
    const map: Record<string, string> = { '1': 'p1', '2': 'p2', '3': 'p3', '4': 'p4', '5': 'p5' }
    return map[p] ?? 'p3'
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default async function BandejaPage() {
    // Query with JOINs
    let rows: Awaited<ReturnType<typeof fetchRequests>> = []
    let error: string | null = null

    try {
        rows = await fetchRequests()
    } catch (e) {
        error = (e as Error).message
    }

    const requests = rows.map(r => ({
        ...r,
        slaStatus: computeSlaStatus(r.dueAt, r.resolutionHours ?? 72) as SlaStatus,
        relativeDate: formatRelativeTime(r.createdAt),
        priorityKey: priorityLabel(r.priority),
    }))

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

                {/* Error state */}
                {error && (
                    <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-500">error</span>
                        <div>
                            <p className="text-sm font-semibold text-red-700">Error de conexión a la base de datos</p>
                            <p className="text-xs text-red-600 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!error && requests.length === 0 && (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-400">
                        <span className="material-symbols-outlined text-6xl">inbox</span>
                        <p className="text-lg font-medium">Bandeja vacía</p>
                        <p className="text-sm">No hay solicitudes asignadas a tu área.</p>
                    </div>
                )}

                {/* Table */}
                {requests.length > 0 && (
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 w-12">
                                        <input className="rounded border-slate-300" type="checkbox" />
                                    </th>
                                    <th className="px-6 py-3">Solicitud</th>
                                    <th className="px-6 py-3">Prioridad</th>
                                    <th className="px-6 py-3">SLA</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3">Servicio</th>
                                    <th className="px-6 py-3 text-right">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {requests.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="cursor-pointer transition-colors hover:bg-slate-50"
                                    >
                                        <td className="px-6 py-4">
                                            <input className="rounded border-slate-300" type="checkbox" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-slate-900 truncate max-w-[200px]" title={req.subject}>
                                                    {req.subject}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                    {req.citizenFullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <PriorityIndicator priority={req.priorityKey as any} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <SLABadge status={req.slaStatus} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status as any} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded">
                                                {req.serviceName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                                            {req.relativeDate}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Right panel — placeholder for selected request detail */}
            <aside className="w-[340px] bg-slate-50 border-l border-slate-200 flex flex-col items-center justify-center shrink-0 text-slate-400 gap-3">
                <span className="material-symbols-outlined text-5xl">touch_app</span>
                <p className="text-sm font-medium">Seleccioná una solicitud</p>
                <p className="text-xs">Para ver el perfil del ciudadano</p>
            </aside>
        </div>
    )
}

// ─── Drizzle query ───────────────────────────────────────────────────────────
async function fetchRequests() {
    const rows = await db
        .select({
            id: request.id,
            subject: request.subject,
            status: request.status,
            priority: request.priority,
            channel: request.channel,
            dueAt: request.dueAt,
            createdAt: request.createdAt,
            citizenFullName: citizen.fullName,
            citizenId: citizen.id,
            serviceName: serviceCatalog.name,
            serviceCode: serviceCatalog.code,
            resolutionHours: slaPolicy.resolutionHours,
            assignedUserFullName: internalUser.fullName,
        })
        .from(request)
        .innerJoin(citizen, eq(request.citizenId, citizen.id))
        .innerJoin(serviceCatalog, eq(request.serviceId, serviceCatalog.id))
        .leftJoin(slaPolicy, eq(slaPolicy.serviceId, request.serviceId))
        .leftJoin(internalUser, eq(request.assignedUserId, internalUser.id))
        .orderBy(asc(request.dueAt), desc(request.createdAt))
        .limit(50)

    // De-dup per request (multiple sla_policy rows per service)
    const seen = new Set<string>()
    return rows.filter(r => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
    })
}
