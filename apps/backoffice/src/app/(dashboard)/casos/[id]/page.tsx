import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db, auditEvent, organizationUnit, internalUser } from '@repo/db'
import { fetchCaseDetail } from '@/lib/queries/case-detail'

import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityIndicator } from '@/components/ui/PriorityIndicator'
import { SLABadge } from '@/components/ui/SLABadge'

import { WorkflowStepper } from './components/WorkflowStepper'
import { RightPanelWrapper } from './components/RightPanelWrapper'

function computeSlaStatus(dueAt: Date | null, resolutionHours: number) {
    if (!dueAt) return 'on_time'
    const now = Date.now()
    const due = dueAt.getTime()
    const warningBuffer = resolutionHours * 0.2 * 60 * 60 * 1000
    if (now >= due) return 'overdue'
    if (now >= due - warningBuffer) return 'at_risk'
    return 'on_time'
}

function priorityLabel(p: string): string {
    const map: Record<string, string> = { '1': 'p1', '2': 'p2', '3': 'p3', '4': 'p4', '5': 'p5' }
    return map[p] ?? 'p3'
}

function formatDate(d: Date) {
    return new Intl.DateTimeFormat('es-AR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(d))
}

export default async function CaseDetailPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params
    const id = resolvedParams.id
    const detail = await fetchCaseDetail(id)

    if (!detail) {
        notFound()
    }

    const session = await auth()
    const sessionUserId = (session as any)?.id || null

    // Register Audit Event (view)
    try {
        await db.insert(auditEvent).values({
            actorUserId: sessionUserId,
            actorType: 'internal',
            entityType: 'case_view',
            entityId: id,
            action: 'view',
        })
    } catch (e) {
        console.error('Failed to register audit event', e)
    }

    // Needed for forms
    const orgUnits = await db.select({ id: organizationUnit.id, name: organizationUnit.name }).from(organizationUnit)
    const users = await db.select({ id: internalUser.id, fullName: internalUser.fullName }).from(internalUser)

    const slaStatus = computeSlaStatus(detail.dueAt ?? null, detail.resolutionHours ?? 72)
    const pKey = priorityLabel(detail.priority ?? '3') as any

    return (
        <div className="flex h-full bg-slate-50/50 w-full overflow-hidden">

            {/* Main Flow (Left Column) */}
            <main className="flex-1 flex flex-col min-w-0 bg-white border-r border-slate-200 overflow-y-auto">
                <header className="bg-white border-b border-slate-200 p-6 sm:p-8 shrink-0 relative z-10 shadow-sm">
                    <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                        <span className="material-symbols-outlined text-sm">tag</span>
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md">REQ-{detail.id?.split('-').shift()?.toUpperCase()}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span className="font-medium text-slate-700 truncate">{detail.citizenFullName}</span>
                    </div>

                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                            {detail.subject}
                        </h1>
                        <div className="flex items-center gap-3 shrink-0">
                            <PriorityIndicator priority={pKey} />
                            <SLABadge status={slaStatus as any} />
                            <StatusBadge status={detail.status as any} />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-100/60 text-sm">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Servicio</p>
                            <p className="font-medium text-slate-800">{detail.serviceName}</p>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Organismo a cargo</p>
                            <p className="font-medium text-slate-800 flex items-center gap-1.5 flex-wrap">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance</span>
                                {detail.orgUnitName || 'Central'}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="p-6 sm:p-8 flex flex-col gap-10">

                    {/* Resumen */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2c6bc3]">description</span>
                            Detalles del Caso
                        </h3>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {detail.description || 'Sin descripción.'}
                            </p>
                            {detail.caseSummary && (
                                <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 shadow-sm">
                                    <span className="font-bold block mb-1 text-slate-900">Resolución preliminar / Notas:</span>
                                    {detail.caseSummary}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Stepper Workflow */}
                    <section>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2c6bc3]">conversion_path</span>
                            Flujo de Trabajo
                        </h3>
                        <WorkflowStepper workItems={detail.workItems} currentStatus={detail.status} />
                    </section>

                    {/* Historial de Trazabilidad */}
                    <section className="mb-10">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">history</span>
                            Historial de Derivaciones
                        </h3>
                        {detail.assignments.length > 0 ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 text-slate-500 border-b border-slate-200 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Fecha</th>
                                            <th className="px-4 py-2 font-medium">Origen → Destino</th>
                                            <th className="px-4 py-2 font-medium">Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {detail.assignments.map(a => (
                                            <tr key={a.id}>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{formatDate(a.createdAt)}</td>
                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                    {(a as any).fromOrgUnitName || 'Bandeja Central'}
                                                    <span className="mx-2 text-slate-300">→</span>
                                                    <span className="text-[#2c6bc3]">{(a as any).toOrgUnitName || 'Central'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">{a.reason || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic px-1">No hay derivaciones para esta solicitud.</p>
                        )}
                    </section>
                </div>
            </main>

            {/* Right Column — Tab System para Panel de Acciones y AI */}
            <aside className="w-[360px] bg-slate-50 border-l border-slate-200 flex flex-col overflow-y-hidden shrink-0 z-10">
                <RightPanelWrapper
                    detailId={detail.id}
                    status={detail.status!}
                    orgUnits={orgUnits}
                    users={users}
                    documents={detail.documents}
                />
            </aside>
        </div>
    )
}
