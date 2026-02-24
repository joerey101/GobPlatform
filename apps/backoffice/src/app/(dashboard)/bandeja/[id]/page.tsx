import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { db, auditEvent } from '@repo/db'
import { fetchRequestDetail } from '@/lib/queries/request-detail'
import { CitizenAvatar } from '@/components/ui/CitizenAvatar'
import { ChannelBadge } from '@/components/ui/ChannelBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityIndicator } from '@/components/ui/PriorityIndicator'
import { SLABadge } from '@/components/ui/SLABadge'

// Helper de SLA (mismo que en bandeja/page.tsx)
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
    }).format(d)
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
    // Next 15 requiere que params sea un awaited para dynamic routes
    const resolvedParams = await params
    const id = resolvedParams.id
    const detail = await fetchRequestDetail(id)

    if (!detail) {
        notFound()
    }

    const session = await auth()
    const sessionUserId = (session as any)?.id || null

    // Register Audit Event
    try {
        await db.insert(auditEvent).values({
            actorUserId: sessionUserId,
            actorType: 'internal',
            entityType: 'request',
            entityId: id,
            action: 'view',
        })
    } catch (e) {
        console.error('Failed to register audit event', e)
    }

    const slaStatus = computeSlaStatus(detail.dueAt ?? null, detail.resolutionHours ?? 72)
    const pKey = priorityLabel(detail.priority ?? '3') as any

    return (
        <div className="flex h-full bg-slate-50 w-full overflow-hidden">
            {/* Columna Izquierda — Perfil Ciudadano */}
            <aside className="w-[360px] bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto shrink-0 shadow-sm z-10">
                <div className="flex flex-col items-center mb-8">
                    <CitizenAvatar
                        size="xl"
                        name={detail.citizenFullName}
                        verified={!!detail.citizenDni} // DNI presente = verificado
                    />
                    <h2 className="mt-4 text-2xl font-bold text-slate-800 text-center leading-tight">
                        {detail.citizenFullName}
                    </h2>
                    {detail.citizenDni && (
                        <p className="mt-2 px-3 py-1 bg-slate-100 rounded-md text-slate-600 text-sm font-mono tracking-wide border border-slate-200">
                            DNI {detail.citizenDni}
                        </p>
                    )}
                    {detail.citizenBirthDate && (
                        <p className="mt-3 text-sm text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">cake</span>
                            {new Date(detail.citizenBirthDate).toLocaleDateString('es-AR')}
                        </p>
                    )}
                </div>

                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Puntos de Contacto
                    </h3>
                    <div className="flex flex-col gap-2">
                        {detail.contacts.length > 0 ? (
                            detail.contacts.map((contact, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                                    <ChannelBadge channel={contact.type as any} />
                                    <span className="truncate">{contact.value}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic">No hay contactos registrados.</p>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Domicilio
                    </h3>
                    {detail.address ? (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="material-symbols-outlined text-slate-400 mt-0.5">location_on</span>
                                <div>
                                    <p className="font-semibold">{detail.address.street} {detail.address.houseNumber}</p>
                                    <p className="text-slate-500 mt-0.5">{detail.address.city}, {detail.address.province}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Sin domicilio registrado.</p>
                    )}
                </div>

                <div className="mt-auto pt-6">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#2c6bc3] hover:bg-[#1A4B8F] text-white py-2.5 rounded-lg transition-colors font-medium shadow-sm">
                        <span className="material-symbols-outlined text-sm">add</span>
                        Nueva Acción
                    </button>
                    <Link
                        href="/dashboard/bandeja"
                        className="w-full mt-3 flex items-center justify-center gap-2 text-[#2c6bc3] hover:bg-blue-50 py-2.5 rounded-lg transition-colors font-medium border border-[#2c6bc3]/20"
                    >
                        Volver a la bandeja
                    </Link>
                </div>
            </aside>

            {/* Columna Derecha — Detalle del caso */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                {/* Fixed Header */}
                <header className="bg-white border-b border-slate-200 p-6 shrink-0 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                            <span className="material-symbols-outlined text-sm">tag</span>
                            <span className="font-mono">REQ-{detail.id?.split('-').shift()?.toUpperCase()}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight pr-6">
                            {detail.subject}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <PriorityIndicator priority={pKey} />
                        <SLABadge status={slaStatus as any} />
                        <StatusBadge status={detail.status as any} />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">

                    {/* Info Card */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 md:gap-12">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Servicio</p>
                            <p className="font-medium text-slate-800">{detail.serviceName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Organismo</p>
                            <p className="font-medium text-slate-800 flex items-center gap-1.5 flex-wrap">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">account_balance</span>
                                {detail.orgUnitName || 'Central'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Responsable</p>
                            <div className="flex items-center gap-2">
                                <div className="size-6 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                    <span className="material-symbols-outlined text-[14px] text-slate-500">person</span>
                                </div>
                                <span className="font-medium text-slate-800 text-sm">{detail.assignedUserFullName || 'Sin asignar'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resumen */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Descripción del caso</h3>
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-[15px]">
                            {detail.description || 'No hay descripción disponible para esta solicitud.'}
                        </p>
                        {detail.caseSummary && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                <span className="font-semibold block mb-1">Resolución / Notas previas:</span>
                                {detail.caseSummary}
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Línea de Tiempo</h3>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6">
                            {detail.interactions.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                    {detail.interactions.map((interaction, ix) => (
                                        <div key={interaction.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Date / Time */}
                                            <div className="absolute pl-14 sm:pl-0 sm:static sm:flex-1 flex sm:flex-col items-center justify-center w-full px-2 text-center text-xs text-slate-400 bg-white md:bg-transparent -translate-y-6 sm:translate-y-0 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity">
                                                <div className={`p-1.5 rounded-lg border border-slate-200 bg-slate-50 shadow-sm mx-auto shadow-sm ${ix % 2 === 0 ? 'md:ml-auto md:mr-8' : 'md:mr-auto md:ml-8'}`}>
                                                    <span className="font-semibold px-2 py-0.5 text-slate-600">
                                                        {formatDate(interaction.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Icon */}
                                            <div className="flex items-center justify-center size-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow-sm shrink-0 md:order-1 z-10 relative">
                                                <ChannelBadge channel={interaction.channel as any} />
                                            </div>

                                            {/* Content Card */}
                                            <div className={`w-full sm:w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative ${ix % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                                                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-800">
                                                            {interaction.direction === 'inbound' ? 'Entrante' : 'Saliente'}
                                                        </span>
                                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold text-white rounded-full ${interaction.direction === 'inbound' ? 'bg-[#2c6bc3]' : 'bg-slate-500'}`}>
                                                            {interaction.direction}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 text-sm whitespace-pre-wrap">
                                                    {interaction.content || <span className="italic text-slate-400">Sin contenido documentado</span>}
                                                </p>
                                                {interaction.userName && (
                                                    <p className="mt-3 text-xs text-slate-400 text-right">
                                                        Operador: {interaction.userName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">history</span>
                                    <p className="text-slate-500">Aún no hay interacciones en esta solicitud.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
